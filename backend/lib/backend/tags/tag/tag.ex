defmodule Backend.Tags.Tag do
  use Backend, :model

  alias Backend.Services.Service
  alias Backend.Accounts.User

  import Ecto.Changeset

  @required_fields [:tagger_id, :tagged_id]
  @optional_fields [:metadata, :approved]
  @all_fields @required_fields ++ @optional_fields

  schema "tags" do
    field(:approved, :boolean, default: false)
    field(:metadata, :map)

    belongs_to(:tagger, User)
    belongs_to(:tagged, User)

    # has_one(:asset, Asset)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
  end
end
