defmodule Backend.Repo.Migrations.AddAccidentsFieldInVehicleDriversTable do
  use Ecto.Migration

  def change do
    alter table(:vehicle_drivers) do
      add(:accidents, :integer)
    end
  end
end
