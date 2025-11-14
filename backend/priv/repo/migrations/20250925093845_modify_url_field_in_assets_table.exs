defmodule Backend.Repo.Migrations.ModifyUrlFieldInAssetsTable do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      modify :url, :text
    end
  end
end
