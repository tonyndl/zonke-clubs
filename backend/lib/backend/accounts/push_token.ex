defmodule Backend.Accounts.PushToken do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "push_tokens" do
    field :expo_push_token, :string
    field :platform, :string
    field :device_id, :string

    belongs_to :user, Backend.Accounts.User

    timestamps()
  end

  @required_fields [:expo_push_token, :user_id]
  @optional_fields [:platform, :device_id]
  @all_fields @required_fields ++ @optional_fields

  def changeset(push_token, attrs) do
    push_token
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> unique_constraint(:expo_push_token)
  end
end
