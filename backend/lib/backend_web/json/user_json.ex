defmodule BackendWeb.UserJSON do
  alias BackendWeb.Assets.AssetJSON
  alias Backend.Assets.Assets

  def show(%{user: user}) do
    # IO.inspect(user)
    asset =
      if Ecto.assoc_loaded?(user.asset) and user.asset do
        AssetJSON.show(%{asset: user.asset})
      else
        nil
      end

    %{
      id: Map.get(user, :id),
      first_name: Map.get(user, :first_name),
      last_name: Map.get(user, :last_name),
      username: Map.get(user, :username),
      email: Map.get(user, :email),
      role: Map.get(user, :role),
      location: Map.get(user, :location),
      asset_url: Map.get(user, :asset_filename) |> Assets.prepare_url(),
      asset: asset
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})
  end
end
