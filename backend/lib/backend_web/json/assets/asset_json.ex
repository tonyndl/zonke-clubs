defmodule BackendWeb.Assets.AssetJSON do
  alias Backend.Assets.Assets

  def index(%{assets: assets, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(asset <- assets, do: show(%{asset: asset}))
    }
  end

  def index(%{assets: assets}) do
    for(asset <- assets, do: show(%{asset: asset}))
  end

  def show(%{asset: asset}) do
    %{
      id: asset.id,
      copied: asset.copied,
      meta: asset.meta,
      filename: asset.filename,
      url: Assets.prepare_url(asset.filename),
      inserted_at: asset.inserted_at,
      updated_at: asset.updated_at
    }
  end
end
