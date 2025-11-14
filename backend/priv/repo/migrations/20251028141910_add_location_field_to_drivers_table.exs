defmodule Backend.Repo.Migrations.AddLocationFieldToDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      add(:location, :map)
    end
  end
end
