defmodule Backend.Posts.Post do
  use Backend, :model

  alias Backend.Accounts.{BusinessProfile, User}
  alias Backend.Assets.Asset

  @required_fields [:description, :business_profile_id]
  @optional_fields [:location, :location_options, :licences]
  @all_fields @required_fields ++ @optional_fields

  schema "posts" do
    field(:description, :string)
    field(:location, :map)
    field(:location_options, {:array, :string})
    field(:licences, {:array, :string})
    field(:searchable_document, Backend.Ecto.EctoTypes.Tsvector)

    field(:rank_value, :decimal, virtual: true)

    belongs_to(:business_profile, BusinessProfile)

    has_one(:asset, Asset)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
  end
end
