defmodule Backend.Accounts.Membership do
  use Backend, :model

  alias Backend.Accounts.{User, BusinessProfile}
  alias Backend.Ecto.EctoEnums.RoleEnum

  @required_fields [:user_id, :role]
  schema "memberships" do
    field(:role, RoleEnum)

    belongs_to(:user, User)

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields)
    |> validate_required(@required_fields)
    |> assoc_constraint(:user)
  end
end
