defmodule Backend.Repo.Migrations.RemoveUrlFieldInAssetsTable do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      remove(:url)
    end
  end
end
