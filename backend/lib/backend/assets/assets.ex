defmodule Backend.Assets do
  @moduledoc """
  Context module for managing file assets with S3 storage.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Assets.Asset
  alias ExAws.S3
  alias Ecto.Multi

  @bucket "zonke-clubs-bucket"
  # 7 days in seconds
  @expires_in 604_000
  # 50MB max size for images only — videos have no size limit (duration enforced client-side)
  @max_image_size 50 * 1024 * 1024

  @allowed_image_types [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif"
  ]
  @allowed_video_types ["video/mp4", "video/quicktime", "video/x-msvideo", "video/mpeg"]

  # === S3 UPLOAD/DOWNLOAD FUNCTIONS ===

  # Validates file type and (for images) size
  defp validate_file(%Plug.Upload{content_type: content_type, path: path}) do
    with :ok <- validate_file_type(content_type) do
      if content_type in @allowed_image_types do
        validate_image_size(path)
      else
        :ok
      end
    end
  end

  defp validate_file_type(content_type) do
    allowed_types = @allowed_image_types ++ @allowed_video_types

    if content_type in allowed_types do
      :ok
    else
      {:error,
       "File type #{content_type} not allowed. Supported: images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, MPEG)"}
    end
  end

  defp validate_image_size(path) do
    case File.stat(path) do
      {:ok, %{size: size}} when size <= @max_image_size ->
        :ok

      {:ok, %{size: size}} ->
        {:error,
         "Image size #{size} bytes exceeds maximum of #{@max_image_size} bytes (#{@max_image_size / 1024 / 1024}MB)"}

      {:error, reason} ->
        {:error, "Failed to read file: #{inspect(reason)}"}
    end
  end

  @doc """
  Uploads a file to S3 and saves the asset record.
  """
  def upload_and_save(%{file: %Plug.Upload{path: path, filename: filename} = file} = params) do
    # Validate file before upload
    with :ok <- validate_file(file) do
      # Generate unique filename to avoid collisions
      unique_filename = generate_unique_filename(filename)

      Multi.new()
      |> Multi.run(:s3_upload, fn _repo, _changes ->
        case put_object(path, unique_filename) do
          {:ok, resp} -> {:ok, resp}
          {:error, reason} -> {:error, {:s3_upload_failed, reason}}
        end
      end)
      |> Multi.run(:asset, fn _repo, _changes ->
        params
        |> Map.merge(%{filename: unique_filename})
        |> Map.delete(:file)
        |> create_asset()
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{asset: asset}} ->
          {:ok, asset}

        {:error, :s3_upload, {:s3_upload_failed, reason}, _changes} ->
          {:error, "Failed to upload file: #{inspect(reason)}"}

        {:error, :asset, changeset, _changes} ->
          {:error, changeset}
      end
    end
  end

  @doc """
  Updates an asset with a new file.
  """
  def update_asset_with_file(
        %Asset{} = asset,
        %{file: %Plug.Upload{path: path, filename: filename} = file} = params
      ) do
    # Validate file before upload
    with :ok <- validate_file(file) do
      unique_filename = generate_unique_filename(filename)

      Multi.new()
      |> Multi.run(:delete_old_s3_file, fn _repo, _changes ->
        if asset.filename do
          case delete_object(asset.filename) do
            {:ok, _} -> {:ok, :deleted}
            {:error, reason} -> {:error, {:delete_old_file_failed, reason}}
          end
        else
          {:ok, :no_file_to_delete}
        end
      end)
      |> Multi.run(:new_s3_upload, fn _repo, _changes ->
        case put_object(path, unique_filename) do
          {:ok, resp} -> {:ok, resp}
          {:error, reason} -> {:error, {:s3_upload_failed, reason}}
        end
      end)
      |> Multi.run(:updated_asset, fn _repo, _changes ->
        asset_params =
          params
          |> Map.merge(%{filename: unique_filename})
          |> Map.delete(:file)

        update_asset(asset, asset_params)
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{updated_asset: updated_asset}} ->
          {:ok, updated_asset}

        {:error, :delete_old_s3_file, {:delete_old_file_failed, reason}, _changes} ->
          {:error, "Failed to delete old file: #{inspect(reason)}"}

        {:error, :new_s3_upload, {:s3_upload_failed, reason}, _changes} ->
          {:error, "Failed to upload file: #{inspect(reason)}"}

        {:error, :updated_asset, changeset, _changes} ->
          {:error, changeset}
      end
    end
  end

  @doc """
  Uploads raw binary data to S3 with proper content type.
  """
  def put_object(file_path, filename) do
    body = File.read!(file_path)
    content_type = get_content_type(filename)

    ExAws.S3.put_object(@bucket, filename, body, content_type: content_type)
    |> ExAws.request(config: s3_config())
  end

  # Determine content type based on file extension
  defp get_content_type(filename) do
    extension = filename |> Path.extname() |> String.downcase()

    case extension do
      # Videos
      ".mp4" -> "video/mp4"
      ".mov" -> "video/quicktime"
      ".avi" -> "video/x-msvideo"
      ".mpeg" -> "video/mpeg"
      ".mpg" -> "video/mpeg"
      # Images
      ".jpg" -> "image/jpeg"
      ".jpeg" -> "image/jpeg"
      ".png" -> "image/png"
      ".gif" -> "image/gif"
      ".webp" -> "image/webp"
      ".heic" -> "image/heic"
      ".heif" -> "image/heif"
      # Default
      _ -> "application/octet-stream"
    end
  end

  @doc """
  Deletes an object from S3.
  """
  def delete_object(filename) do
    S3.delete_object(@bucket, filename)
    |> ExAws.request(config: s3_config())
  end

  @doc """
  Generates a presigned URL for secure file access.
  """
  def presigned_url(filename) do
    case S3.presigned_url(s3_config(), :get, @bucket, filename, expires_in: @expires_in) do
      {:ok, url} -> {:ok, url}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Generates a public download URL.
  """
  def download_url(filename, %{public: true, dt: dt}) do
    config = s3_config()
    port = ExAws.S3.Utils.sanitized_port_component(config)
    params = URI.encode_query(t: DateTime.to_unix(dt, :millisecond))

    if Mix.env() == :dev do
      # LocalStack URL
      "#{config[:scheme]}#{config[:host]}#{port}/#{@bucket}/#{filename}?#{params}"
    else
      # Real AWS URL
      "https://#{@bucket}.s3.amazonaws.com/#{filename}?#{params}"
    end
  end

  @doc """
  Prepares a URL for an asset (either presigned or public).
  """
  def prepare_url(filename, opts \\ %{public: false}) do
    case filename do
      nil ->
        nil

      filename ->
        if opts.public do
          download_url(filename, %{public: true, dt: DateTime.utc_now()})
        else
          case presigned_url(filename) do
            {:ok, url} -> url
            _ -> nil
          end
        end
    end
  end

  @doc """
  Returns S3 configuration (LocalStack for dev, AWS for prod).
  """
  def s3_config do
    if Mix.env() == :dev do
      # Use local network IP for mobile device access
      # Change this to your machine's IP address if different
      local_ip = System.get_env("LOCAL_IP") || "192.168.1.140"

      ExAws.Config.new(:s3,
        scheme: "http://",
        host: local_ip,
        port: 4566,
        region: "us-east-1"
      )
    else
      ExAws.Config.new(:s3)
    end
  end

  @doc """
  Ensures the S3 bucket exists (for development setup).
  """
  def ensure_bucket_exists do
    case ExAws.S3.head_bucket(@bucket) |> ExAws.request() do
      {:ok, _} ->
        IO.puts("✅ Bucket #{@bucket} exists")
        :ok

      {:error, {:http_error, 404, _}} ->
        IO.puts("📦 Creating bucket #{@bucket}")
        ExAws.S3.put_bucket(@bucket, "us-east-1") |> ExAws.request()

      {:error, reason} ->
        IO.inspect(reason, label: "❌ S3 error")
        {:error, reason}
    end
  end

  defp generate_unique_filename(original_filename) do
    timestamp = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    random_string = :crypto.strong_rand_bytes(8) |> Base.url_encode64() |> binary_part(0, 8)
    extension = Path.extname(original_filename)
    base_name = Path.basename(original_filename, extension)

    "#{base_name}_#{timestamp}_#{random_string}#{extension}"
  end

  # === DATABASE FUNCTIONS ===

  @doc """
  Gets a single asset by ID.
  """
  def get_asset(id) do
    case Repo.get(Asset, id) do
      nil -> {:error, :not_found}
      asset -> {:ok, asset}
    end
  end

  @doc """
  Creates an asset.
  """
  def create_asset(attrs) do
    %Asset{}
    |> Asset.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates an asset.
  """
  def update_asset(%Asset{} = asset, attrs) do
    asset
    |> Asset.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes an asset.
  """
  def delete_asset(%Asset{} = asset) do
    Repo.delete(asset)
  end

  @doc """
  Gets assets for a club.
  """
  def get_club_asset(club_id) do
    Asset
    |> where([a], a.club_id == ^club_id)
    |> Repo.one()
  end

  @doc """
  Creates or replaces a club's banner image.
  If the club already has an asset, replaces it; otherwise creates a new one.
  """
  def upsert_club_banner(club_id, %{file: _} = params) do
    upload_params = Map.put(params, :club_id, club_id)

    case get_club_asset(club_id) do
      nil -> upload_and_save(upload_params)
      existing -> update_asset_with_file(existing, upload_params)
    end
  end
end
