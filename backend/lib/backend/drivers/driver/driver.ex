defmodule Backend.Drivers.Driver do
  use Backend, :model

  alias Backend.Accounts.{BusinessProfile, User}
  alias Backend.Ecto.Embeds.{PriceFixed}
  alias Backend.Reviews.{Review, Comment}
  alias Backend.Vehicles.Vehicle
  # alias Backend.Bookings.DriverBooking
  alias Backend.Assets.Asset

  @required_fields [:user_id]
  @optional_fields [
    :description,
    :active,
    :paused_at,
    :experience,
    :dob,
    :platforms,
    :licences,
    :location
  ]
  @all_fields @required_fields ++ @optional_fields

  schema "drivers" do
    field(:description, :string)
    field(:active, :boolean, default: false)
    field(:paused_at, :naive_datetime)
    field(:experience, :integer)
    field(:dob, :date)
    field(:platforms, {:array, :string})
    field(:licences, {:array, :string})
    field(:location, :map)
    field(:searchable_document, Backend.Ecto.EctoTypes.Tsvector)

    field(:rating, :float, virtual: true)
    field(:booking_count, :float, virtual: true)
    field(:rank_value, :decimal, virtual: true)
    field(:email, :string, virtual: true)
    field(:first_name, :string, virtual: true)
    field(:last_name, :string, virtual: true)
    field(:username, :string, virtual: true)
    field(:previous_vehicles, :integer, virtual: true)
    field(:total_accidents, :integer, virtual: true)
    field(:asset_url, :string, virtual: true)
    field(:asset_filename, :string, virtual: true)

    belongs_to(:user, User)

    has_one(:asset, Asset)

    has_many(:reviews, Review)
    has_many(:comments, Comment)
    # has_many(:driver_bookings, DriverBooking)

    many_to_many(:vehicles, Vehicle, join_through: VehicleDriver)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> assoc_constraint(:user)
    |> validate_required(@required_fields)
  end
end
