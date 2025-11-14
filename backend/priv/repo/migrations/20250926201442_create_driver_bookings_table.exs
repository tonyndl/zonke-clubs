defmodule Backend.Repo.Migrations.CreateDriverBookingsTable do
  use Ecto.Migration

  def up do
    execute("CREATE TYPE booking_status_enum AS ENUM ('pending', 'accepted', 'rejected')")

    create table(:driver_bookings, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:booked_date, :utc_datetime)
      add(:note, :string)
      add(:duration, :map)
      add(:price_fixed, :map)

      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)
      add(
        :driver_id,
        references(:drivers, type: :uuid, on_delete: :delete_all),
        null: false
      )

      timestamps()
    end
  end

  def down do
    drop table(:driver_bookings)
    execute("DROP TYPE booking_status_enum")
  end
end
