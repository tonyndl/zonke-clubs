defmodule Backend.Repo.Migrations.AddDeviceLocationToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :device_lat, :float
      add :device_lng, :float
      add :device_location_at, :utc_datetime
    end
  end
end
