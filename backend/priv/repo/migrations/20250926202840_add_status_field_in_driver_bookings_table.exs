defmodule Backend.Repo.Migrations.AddStatusFieldInDriverBookingsTable do
  use Ecto.Migration

  def change do
    alter table(:driver_bookings) do
      add(:status, :booking_status_enum, default: "pending", null: false)
    end
  end
end
