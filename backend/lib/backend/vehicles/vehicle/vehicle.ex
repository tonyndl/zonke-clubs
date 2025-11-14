defmodule Backend.Vehicles.Vehicle do
  use Backend, :model

  alias Backend.Accounts.{User, BusinessProfile}
  alias Backend.Vehicles.VehicleDriver
  alias Backend.Drivers.Driver
  alias Backend.Ecto.Embeds.PriceFixed
  alias Backend.Assets.Asset
  alias Backend.Applications.VehicleApplication
  alias Backend.Reviews.Review
  alias Backend.Ecto.EctoEnums.{VehicleTypeEnum, FuelTypeEnum}

  @required_fields [:user_id, :type, :brand, :model, :fuel_type, :manual]
  @optional_fields [
    :description,
    :mileage,
    :active,
    :engine_capacity,
    :passengers,
    :model_year
  ]
  @embeds [:price_fixed]
  @all_fields @required_fields ++ @optional_fields ++ @embeds

  schema "vehicles" do
    field(:model, :string)
    field(:description, :string)
    field(:mileage, :integer)
    field(:active, :boolean, default: false)
    field(:type, VehicleTypeEnum)
    field(:brand, :string)
    field(:manual, :boolean)
    field(:fuel_type, FuelTypeEnum)
    field(:engine_capacity, :float)
    field(:passengers, :integer)
    field(:model_year, :integer)
    field(:searchable_document, Backend.Ecto.EctoTypes.Tsvector)

    embeds_one(:price_fixed, PriceFixed, on_replace: :update)

    field(:rank_value, :decimal, virtual: true)
    field(:unseen_applications_count, :integer, virtual: true)

    belongs_to(:user, User)

    has_one(:asset, Asset)
    has_many(:vehicle_applications, VehicleApplication)
    has_many(:vehicle_drivers, VehicleDriver)
    has_many(:reviews, Review)

    many_to_many(:drivers, Driver, join_through: VehicleDriver)

    timestamps()
  end

  def changeset(vehicle, attrs) do
    vehicle
    |> cast(attrs, @all_fields -- @embeds)
    |> cast_embed(:price_fixed, required: true, with: &PriceFixed.changeset/2)
    |> validate_required(@required_fields)
  end
end
