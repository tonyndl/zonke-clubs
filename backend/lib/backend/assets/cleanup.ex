defmodule Backend.Assets.Cleanup do
  @moduledoc """
  Cleanup utilities for orphaned assets (database records without S3 files).
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Assets.Asset
  alias Backend.Assets

  @doc """
  Removes all asset records from the database where the corresponding S3 file doesn't exist.
  Returns {removed_count, errors}.
  """
  def remove_orphaned_assets do
    assets = Repo.all(Asset)
    IO.puts("Checking #{length(assets)} assets...")

    results =
      Enum.map(assets, fn asset ->
        check_and_remove_if_missing(asset)
      end)

    removed = Enum.count(results, fn {status, _} -> status == :removed end)
    errors = Enum.filter(results, fn {status, _} -> status == :error end)

    IO.puts("\n✅ Cleanup complete:")
    IO.puts("  - Removed: #{removed}")
    IO.puts("  - Errors: #{length(errors)}")

    {removed, errors}
  end

  @doc """
  Checks if an asset's file exists in S3, removes the database record if not.
  """
  def check_and_remove_if_missing(%Asset{} = asset) do
    case file_exists_in_s3?(asset.filename) do
      true ->
        {:ok, asset}

      false ->
        IO.puts("Removing orphaned asset: #{asset.filename} (ID: #{asset.id})")

        case Repo.delete(asset) do
          {:ok, _} -> {:removed, asset}
          {:error, changeset} -> {:error, {asset, changeset}}
        end
    end
  end

  @doc """
  Checks if a file exists in S3 by attempting to get its metadata.
  Returns true if file exists, false otherwise.
  """
  def file_exists_in_s3?(filename) when is_binary(filename) do
    bucket = "zonke-clubs-bucket"
    config = Assets.s3_config()

    case ExAws.S3.head_object(bucket, filename) |> ExAws.request(config: config) do
      {:ok, _} -> true
      {:error, {:http_error, 404, _}} -> false
      {:error, _} -> false
    end
  end

  def file_exists_in_s3?(nil), do: false

  @doc """
  Removes assets for a specific user where files don't exist in S3.
  """
  def remove_orphaned_assets_for_user(user_id) do
    assets = Repo.all(from a in Asset, where: a.user_id == ^user_id)
    IO.puts("Checking #{length(assets)} assets for user #{user_id}...")

    results = Enum.map(assets, &check_and_remove_if_missing/1)

    removed = Enum.count(results, fn {status, _} -> status == :removed end)
    {removed, []}
  end

  @doc """
  Removes assets for posts where files don't exist in S3.
  Also updates user avatar_url if the avatar file doesn't exist.
  Also deletes posts that have no assets remaining.
  """
  def cleanup_all do
    IO.puts("\n🧹 Starting comprehensive cleanup...\n")

    # Clean up orphaned assets
    {removed_assets, _errors} = remove_orphaned_assets()

    # Clean up user avatars that don't exist in S3
    removed_avatars = cleanup_user_avatars()

    # Clean up posts with no assets
    removed_posts = cleanup_posts_without_assets()

    IO.puts("\n✅ Total cleanup:")
    IO.puts("  - Asset records removed: #{removed_assets}")
    IO.puts("  - User avatars cleared: #{removed_avatars}")
    IO.puts("  - Posts removed (no assets): #{removed_posts}")

    :ok
  end

  @doc false
  def cleanup_user_avatars do
    users = Repo.all(Backend.Accounts.User)
    IO.puts("\nChecking #{length(users)} user avatars...")

    results =
      Enum.map(users, fn user ->
        if user.avatar_url do
          # Extract filename from URL
          filename = extract_filename_from_url(user.avatar_url)

          if filename && !file_exists_in_s3?(filename) do
            IO.puts("Clearing missing avatar for user: #{user.first_name} #{user.last_name}")

            user
            |> Ecto.Changeset.change(%{avatar_url: nil})
            |> Repo.update()

            {:cleared, user}
          else
            {:ok, user}
          end
        else
          {:ok, user}
        end
      end)

    Enum.count(results, fn {status, _} -> status == :cleared end)
  end

  defp extract_filename_from_url(url) when is_binary(url) do
    # Extract filename from URLs like:
    # http://192.168.1.139:4566/zonke-clubs-bucket/avatar_123.jpg?t=123456
    # https://zonke-clubs-bucket.s3.amazonaws.com/avatar_123.jpg?t=123456
    case String.split(url, "/") do
      [_ | _] = parts ->
        # Get last part and remove query string
        parts
        |> List.last()
        |> String.split("?")
        |> List.first()

      _ ->
        nil
    end
  end

  defp extract_filename_from_url(_), do: nil

  @doc """
  Removes posts that have no assets.
  Posts without media content should not exist.
  """
  def cleanup_posts_without_assets do
    # Find all posts with no assets
    posts_without_assets =
      Repo.all(
        from p in Backend.Posts.Post,
          left_join: a in assoc(p, :assets),
          group_by: p.id,
          having: count(a.id) == 0
      )

    IO.puts("\nChecking posts without assets...")
    IO.puts("Found #{length(posts_without_assets)} posts with no assets")

    results =
      Enum.map(posts_without_assets, fn post ->
        IO.puts("Removing post #{post.id} (no assets)")

        case Repo.delete(post) do
          {:ok, _} -> {:removed, post}
          {:error, _changeset} -> {:error, post}
        end
      end)

    Enum.count(results, fn {status, _} -> status == :removed end)
  end
end
