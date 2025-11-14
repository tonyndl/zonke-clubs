defmodule Backend.Repo.Migrations.AddActiveFieldToVehicleDriversTable do
  use Ecto.Migration

  def change do
    alter table(:vehicle_drivers) do
      add(:active, :boolean)
    end
  end
end
