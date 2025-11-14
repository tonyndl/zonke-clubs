defmodule Backend.Accounts.Users do
  alias Backend.Repo
  alias Backend.Accounts.User
  alias Backend.Guardian
  alias Backend.Assets.{Asset, Assets}
  alias Backend.EmptyFieldsHelper

  import Ecto.Query

  def get_user_by(opts \\ []) when is_list(opts) do
    by_opts = Keyword.validate!(opts, [:username, :id])

    case Repo.get_by(User, by_opts) do
      nil ->
        {:error, :not_found}

      user ->
        {:ok, Repo.preload(user, :asset)}
    end
  end

  def update(%User{} = user, params) do
    {asset_params, user_params} = Map.pop(params, :asset)

    with {:ok, _asset} <- maybe_handle_asset(user, asset_params),
         {:ok, _user} <- maybe_update_user(user, user_params),
         updated_user <- Repo.get(User, user.id) |> Repo.preload(:asset) do
      # IO.inspect(updated_user)
      {:ok, updated_user}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp maybe_handle_asset(_user, nil), do: {:ok, :no_asset}

  defp maybe_handle_asset(user, %{file: _} = asset_params),
    do: create_user_asset(user.id, asset_params)

  defp maybe_handle_asset(_user, _), do: {:ok, :no_file_in_asset}

  def create_user_asset(user_id, params) do
    case get_user_asset(user_id) do
      %Asset{} = asset ->
        Assets.update_asset_with_file(asset, params)

      _ ->
        asset_params = Map.put_new(params, :user_id, user_id)
        Assets.upload_and_save(asset_params)
    end
  end

  defp maybe_update_user(user, params) do
    cleaned_params =
      params
      |> Enum.reject(fn {_k, v} -> is_nil(v) or v == "" end)
      |> Enum.into(%{})

    if map_size(cleaned_params) > 0 do
      decoded_params =
        Map.update(cleaned_params, :location, %{}, fn val ->
          if is_binary(val), do: Jason.decode!(val), else: val
        end)

      user
      |> User.changeset(decoded_params)
      |> Repo.update()
    else
      {:ok, user}
    end
  end

  def get_user_asset(user_id) do
    from(a in Asset,
      where: a.user_id == ^user_id
    )
    |> Repo.one()
  end
end
