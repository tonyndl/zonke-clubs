defmodule Backend.Accounts.User do
  use Backend, :model

  alias Backend.Reviews.Review
  alias Backend.Vehicles.Vehicle
  alias Backend.Ecto.EctoEnums.RoleEnum
  alias Backend.Assets.Asset

  @required_fields [:first_name, :last_name, :username, :role]
  @optional_fields [:location, :email]
  @all_fields @required_fields ++ @optional_fields

  schema "users" do
    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:username, :string)
    field(:location, :map)
    field(:password_hash, :string)
    field(:role, RoleEnum)

    field(:password, :string, virtual: true)
    field(:asset_url, :string, virtual: true)
    field(:asset_filename, :string, virtual: true)

    has_one(:asset, Asset)

    has_many(:reviews, Review, foreign_key: :author_id)
    has_many(:vehicles, Vehicle)

    timestamps()
  end

  def changeset(struct, params) do
    struct
    |> cast(params, @all_fields)
    |> validate_required(@required_fields)
    # TODO: change to 20
    |> validate_length(:username, min: 3, max: 250)
    |> unique_constraint(:username, message: "username already taken")
  end

  def registration_changeset(params) do
    %__MODULE__{}
    |> changeset(params)
    |> cast(params, @all_fields ++ [:password])
    |> validate_required(@required_fields ++ [:password])
    |> validate_length(:password, min: 6, max: 100)
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(pass))

      _ ->
        changeset
    end
  end
end
