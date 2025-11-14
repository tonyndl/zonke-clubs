defmodule Backend.Repo.Migrations.AddTypeBrandManualDieselEngineCapacityPassengersFieldsToVehiclesTable do
  use Ecto.Migration

  def up do
    execute("CREATE TYPE vehicle_type_enum AS ENUM ('bike', 'passenger', 'taxi', 'truck', 'lorry')")

    alter table(:vehicles) do
      add(:type, :vehicle_type_enum, null: false)
      add(:brand, :string)
      add(:manual, :boolean)
      add(:diesel, :boolean)
      add(:engine_capacity, :float)
      add(:passengers, :integer)
    end
  end

  def down do
    execute("DROP TYPE vehicle_type_enum")
  end
end
