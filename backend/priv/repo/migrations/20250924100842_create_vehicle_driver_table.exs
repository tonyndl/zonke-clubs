defmodule Backend.Repo.Migrations.CreateVehicleDriverTable do
  use Ecto.Migration

  def change do
    create table(:vehicle_drivers, primary_key: false) do
      add(:id, :uuid, primary_key: true)

      add(:vehicle_id, references(:vehicles, type: :uuid), null: false)
      add(:driver_id, references(:drivers, type: :uuid), null: false)

      timestamps()
    end
  end
end
