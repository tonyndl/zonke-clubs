defmodule Backend.Repo.Migrations.AddSeenFieldToVehicleApplicationsTable do
  use Ecto.Migration

  def change do
    alter table(:vehicle_applications) do
      add(:seen, :boolean, default: false)
    end
  end
end
