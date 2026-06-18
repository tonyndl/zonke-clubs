defmodule BackendWeb.API.AssetJSON do
  alias Backend.Assets

  @doc """
  Renders a single asset.
  """
  def show(%{asset: asset}) do
    data(asset)
  end

  @doc """
  Renders a list of assets.
  """
  def index(%{assets: assets}) do
    %{assets: Enum.map(assets, &data/1)}
  end

  defp data(asset) do
    %{
      id: asset.id,
      filename: asset.filename,
      url: Assets.prepare_url(asset.filename, %{public: true}),
      user_id: asset.user_id,
      club_id: asset.club_id,
      post_id: asset.post_id,
      copied: asset.copied,
      meta: asset.meta,
      inserted_at: asset.inserted_at,
      updated_at: asset.updated_at
    }
  end
end
