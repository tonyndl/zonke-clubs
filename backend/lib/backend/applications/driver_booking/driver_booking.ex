defmodule Backend.Applications.DriverBooking do
  use Backend, :model

  alias Backend.Drivers.Driver
  alias Backend.Accounts.User
  alias Backend.Ecto.EctoEnums.BookingStatusEnum
  alias Backend.Ecto.Embeds.{Duration, PriceFixed}

  import Ecto.Changeset

  @required_fields [:user_id, :driver_id]
  @optional_fields [:note, :booked_date, :status]
  @embeds [:duration, :price_fixed]

  @all_fields @required_fields ++ @optional_fields ++ @embeds

  schema "driver_bookings" do
    field(:booked_date, :date)
    field(:note, :string)
    field(:status, BookingStatusEnum, default: :pending)

    embeds_one(:duration, Duration, on_replace: :update)
    embeds_one(:price_fixed, PriceFixed, on_replace: :update)

    belongs_to(:driver, Driver)
    belongs_to(:user, User)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields -- @embeds)
    |> cast_embed(:duration, required: false, with: &Duration.changeset/2)
    |> cast_embed(:price_fixed, required: false, with: &PriceFixed.changeset/2)
    |> assoc_constraint(:user)
    |> assoc_constraint(:driver)
    |> validate_required(@required_fields)
  end
end
