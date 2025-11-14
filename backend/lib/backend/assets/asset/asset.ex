defmodule Backend.Assets.Asset do
  use Backend, :model

  alias Backend.Accounts.BusinessProfile
  alias Backend.Vehicles.Vehicle

  @required_fields [:filename]
  @optional_fields [:copied, :meta, :vehicle_id, :user_id]
  @all_fields @required_fields ++ @optional_fields

  schema "assets" do
    field(:copied, :boolean)
    field(:meta, :map)
    field(:filename, :string)

    field(:url, :string, virtual: true)

    belongs_to(:vehicle, Vehicle)
    belongs_to(:user, User)

    timestamps()
  end

  def changeset(asset, attrs) do
    asset
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_vehicle_or_user()
  end

  defp validate_vehicle_or_user(changeset) do
    vehicle_id = get_field(changeset, :vehicle_id)
    user_id = get_field(changeset, :user_id)

    if is_nil(vehicle_id) and is_nil(user_id) do
      add_error(
        changeset,
        :base,
        "Either vehicle_id or user_id must be present"
      )
    else
      changeset
    end
  end
end
