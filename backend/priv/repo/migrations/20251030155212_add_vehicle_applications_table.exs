defmodule Backend.Repo.Migrations.AddVehicleApplicationsTable do
  use Ecto.Migration

  def up do
    execute(
      "CREATE TYPE vehicle_application_status_enum AS ENUM ('accepted', 'rejected', 'pending')"
    )

    create table(:vehicle_applications, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:status, :vehicle_application_status_enum)

      add(:vehicle_id, references(:vehicles, type: :uuid, on_delete: :delete_all), null: false)
      add(:driver_id, references(:drivers, type: :uuid, on_delete: :delete_all), null: false)
    end
  end

  def down do
    execute("DROP TYPE vehicle_application_status_enum")
  end
end
