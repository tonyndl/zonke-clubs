defmodule Backend.Repo.Migrations.CreateVehicleBookingsTable do
  use Ecto.Migration

  def up do
    create table(:vehicle_bookings, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:booked_date, :utc_datetime)
      add(:note, :string)
      add(:duration, :map)
      add(:price_fixed, :map)
      add(:status, :booking_status_enum, default: "pending", null: false)

      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)
      add(
        :vehicle_id,
        references(:vehicles, type: :uuid, on_delete: :delete_all),
        null: false
      )

      timestamps()
    end
  end

  def down do
    drop table(:vehicle_bookings)
    execute("DROP TYPE booking_status_enum")
  end
end
