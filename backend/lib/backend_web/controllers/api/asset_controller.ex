defmodule BackendWeb.API.AssetController do
  use BackendWeb, :controller
  alias Backend.Assets

  action_fallback BackendWeb.FallbackController

  @doc """
  Upload a new asset.
  Expects multipart form data with:
  - file: The file to upload
  - user_id, club_id, or post_id: The entity this asset belongs to
  - meta: Optional JSON string with metadata (will be parsed)
  """
  def create(conn, params, session) do
    # Parse meta if it's a JSON string
    parsed_params =
      case Map.get(params, "meta") do
        meta when is_binary(meta) ->
          case Jason.decode(meta) do
            {:ok, decoded} -> Map.put(params, "meta", decoded)
            {:error, _} -> params
          end
        _ -> params
      end

    # Only add user_id if session is a User (not Admin)
    # Admins upload assets without user_id (for club official content)
    params_with_user =
      case session.__struct__ do
        Backend.Accounts.User -> Map.put(parsed_params, "user_id", session.id)
        Backend.Admin.Admin -> parsed_params  # Don't set user_id for admins
        _ -> parsed_params
      end

    # Convert string keys to atom keys for the file parameter
    upload_params = %{
      file: Map.get(params_with_user, "file"),
      user_id: Map.get(params_with_user, "user_id"),
      club_id: Map.get(params_with_user, "club_id"),
      post_id: Map.get(params_with_user, "post_id"),
      meta: Map.get(params_with_user, "meta")
    }
    # Remove nil values
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})

    with {:ok, asset} <- Assets.upload_and_save(upload_params) do
      conn
      |> put_status(:created)
      |> render(:show, asset: asset)
    end
  end

  @doc """
  Get a single asset by ID.
  """
  def show(conn, %{"id" => id}, _session) do
    with {:ok, asset} <- Assets.get_asset(id) do
      conn
      |> put_status(:ok)
      |> render(:show, asset: asset)
    end
  end

  @doc """
  Update an asset with a new file.
  """
  def update(conn, %{"id" => id} = params, _session) do
    with {:ok, asset} <- Assets.get_asset(id),
         {:ok, updated_asset} <- Assets.update_asset_with_file(asset, params) do
      conn
      |> put_status(:ok)
      |> render(:show, asset: updated_asset)
    end
  end

  @doc """
  Delete an asset.
  """
  def delete(conn, %{"id" => id}, _session) do
    with {:ok, asset} <- Assets.get_asset(id),
         {:ok, _} <- Assets.delete_object(asset.filename),
         {:ok, _deleted_asset} <- Assets.delete_asset(asset) do
      conn
      |> put_status(:no_content)
      |> send_resp(:no_content, "")
    end
  end
end
