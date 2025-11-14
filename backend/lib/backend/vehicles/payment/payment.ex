defmodule Backend.Vehicles.Payment do
  use Backend, :model

  alias Backend.Vehicles.VehicleDriver
  alias Backend.Ecto.Embeds.PriceFixed

  @required_fields [:vehicle_driver_id]
  @embeds [:price_fixed]
  @all_fields @required_fields ++ @embeds

  schema "payments" do
    embeds_one(:price_fixed, PriceFixed, on_replace: :update)

    belongs_to(:vehicle_driver, VehicleDriver)

    timestamps()
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, @all_fields -- @embeds)
    |> cast_embed(:price_fixed, required: true, with: &PriceFixed.changeset/2)
    |> assoc_constraint(:vehicle_driver)
    |> validate_required(@required_fields)
  end
end
