defmodule Backend.Repo.Migrations.AddTimestampsToVehicleApplicationsTable do
  use Ecto.Migration

  def change do
    alter table(:vehicle_applications) do
      timestamps()
    end
  end
end
