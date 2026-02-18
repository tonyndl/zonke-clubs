defmodule Backend.Admin.Admin do
  use Backend.Schema
  import Ecto.Changeset

  @required_fields [:email, :name, :role]
  @optional_fields [:phone, :avatar_url, :active]
  @all_fields @required_fields ++ @optional_fields

  @role_values ["super_admin", "club_admin"]

  schema "admins" do
    field :email, :string
    field :name, :string
    field :phone, :string
    field :password_hash, :string
    field :role, :string
    field :avatar_url, :string
    field :active, :boolean, default: true

    # Virtual fields
    field :password, :string, virtual: true

    timestamps()
  end

  @doc """
  Changeset for updating admin profile.
  Does not handle password updates.
  """
  def changeset(admin, attrs) do
    admin
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_length(:name, min: 2, max: 100)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> validate_inclusion(:role, @role_values)
    |> unique_constraint(:email, message: "email already taken")
  end

  @doc """
  Changeset for admin registration.
  Validates and hashes the password.
  """
  def registration_changeset(attrs) do
    %__MODULE__{}
    |> cast(attrs, @all_fields ++ [:password])
    |> validate_required(@required_fields ++ [:password])
    |> validate_length(:name, min: 2, max: 100)
    |> validate_length(:password, min: 8, max: 100)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> validate_inclusion(:role, @role_values)
    |> unique_constraint(:email, message: "email already taken")
    |> put_password_hash()
  end

  @doc """
  Changeset for changing password.
  """
  def password_changeset(admin, attrs) do
    admin
    |> cast(attrs, [:password])
    |> validate_required([:password])
    |> validate_length(:password, min: 8, max: 100)
    |> put_password_hash()
  end

  defp put_password_hash(
         %Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset
       ) do
    put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
  end

  defp put_password_hash(changeset), do: changeset
end
