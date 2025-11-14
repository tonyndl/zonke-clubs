defmodule Backend.Repo.Migrations.CreatePaymentsTable do
  use Ecto.Migration

  def change do
    create table(:payments, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:price_fixed, :map)

      add(:vehicle_driver_id, references(:vehicle_drivers, type: :uuid), null: false)

      timestamps()
    end
  end
end
