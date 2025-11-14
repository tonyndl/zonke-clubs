defmodule Backend.Repo.Migrations.AddFilenameToAssetsTable do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      add(:filename, :string)
    end
  end
end
