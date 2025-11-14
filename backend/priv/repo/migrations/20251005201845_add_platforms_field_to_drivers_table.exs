defmodule Backend.Repo.Migrations.AddPlatformsFieldToDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      add(:platforms, {:array, :string})
    end
  end
end
