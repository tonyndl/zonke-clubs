defmodule Backend.Repo.Migrations.AddFuelTypeFieldAndRemoveDieselFieldInVehiclesTable do
  use Ecto.Migration

  def up do
    execute(
      "CREATE TYPE fuel_type_enum AS ENUM ('diesel', 'petrol', 'electric', 'hybrid', 'hydrogen')"
    )

    alter table(:vehicles) do
      remove(:diesel, :boolean)
      add(:fuel_type, :fuel_type_enum)
    end
  end

  def down do
    drop table(:vehicles)
    execute("DROP TYPE fuel_type_enum")
  end
end
