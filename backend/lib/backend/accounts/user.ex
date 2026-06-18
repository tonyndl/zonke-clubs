defmodule Backend.Accounts.User do
  use Backend.Schema
  import Ecto.Changeset

  @required_fields [:username, :role]
  @optional_fields [
    :email,
    :phone,
    :bio,
    :favorite_drinks,
    :onboarding_complete,
    :avatar_url,
    :location,
    :dj_instagram,
    :dj_tiktok,
    :dj_soundcloud,
    :dj_genres,
    :dj_handles
  ]
  @all_fields @required_fields ++ @optional_fields

  @role_values ["user", "admin", "dj"]

  schema "users" do
    field :email, :string
    field :phone, :string
    field :username, :string
    field :password_hash, :string
    field :role, :string

    # Profile fields
    field :bio, :string
    field :favorite_drinks, {:array, :string}
    field :avatar_url, :string
    field :location, :map
    field :onboarding_complete, :boolean, default: false
    field :spending_visible, :boolean, default: true

    # Device location (real-time proximity tracking for strobe invites)
    field :device_lat, :float
    field :device_lng, :float
    field :device_location_at, :utc_datetime

    # DJ profile fields (only populated when role = "dj")
    field :dj_instagram, :string
    field :dj_tiktok, :string
    field :dj_soundcloud, :string
    field :dj_genres, {:array, :string}, default: []
    # Flexible list of social/platform handles: [%{"platform" => "Instagram", "handle" => "@username"}]
    field :dj_handles, {:array, :map}, default: []

    # Activity tracking
    field :last_seen_at, :naive_datetime

    # Virtual fields
    field :password, :string, virtual: true

    timestamps()
  end

  @doc """
  Changeset for updating user profile.
  Does not handle password updates.
  """
  def changeset(user, attrs) do
    user
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_length(:username, min: 3, max: 50)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> validate_inclusion(:role, @role_values)
    |> unique_constraint(:username, message: "username already taken")
    |> unique_constraint(:email, message: "email already taken")
  end

  @doc """
  Changeset for updating profile setup data (bio, favorite_drinks, etc).
  Only validates profile-specific fields.
  """
  def profile_changeset(user, attrs) do
    user
    |> cast(attrs, [:bio, :favorite_drinks, :avatar_url, :location, :onboarding_complete, :spending_visible])
    |> validate_length(:bio, max: 500)
    |> validate_location()
  end

  # Validates location map structure if provided
  defp validate_location(changeset) do
    case get_change(changeset, :location) do
      nil ->
        changeset

      location when is_map(location) ->
        # Check if location has required name field (either string or atom key)
        if Map.has_key?(location, "name") or Map.has_key?(location, :name) do
          changeset
        else
          add_error(changeset, :location, "must include a name field")
        end

      _ ->
        add_error(changeset, :location, "must be a map")
    end
  end

  @doc """
  Changeset for updating account information (username, email, phone).
  Does not handle password changes - use password_changeset for that.
  """
  def account_info_changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :phone])
    |> validate_length(:username, min: 3, max: 50)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:username, message: "username already taken")
    |> unique_constraint(:email, message: "email already taken")
  end

  @doc """
  Changeset for changing password.
  Requires current password verification before updating.
  """
  def password_changeset(user, attrs) do
    user
    |> cast(attrs, [:password])
    |> validate_required([:password])
    |> validate_length(:password, min: 6, max: 100)
    |> put_password_hash()
  end

  @doc """
  Changeset for user registration.
  Validates and hashes the password.
  """
  def registration_changeset(attrs) do
    %__MODULE__{}
    |> cast(attrs, @all_fields ++ [:password])
    |> validate_required(@required_fields ++ [:password])
    |> validate_length(:username, min: 3, max: 50)
    |> validate_length(:password, min: 6, max: 100)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> validate_inclusion(:role, @role_values)
    |> unique_constraint(:username, message: "username already taken")
    |> unique_constraint(:email, message: "email already taken")
    |> put_password_hash()
  end

  defp put_password_hash(
         %Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset
       ) do
    put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
  end

  defp put_password_hash(changeset), do: changeset

  @doc """
  Changeset for updating DJ-specific profile fields.
  Only allowed for users with role = "dj".
  """
  def dj_profile_changeset(user, attrs) do
    user
    |> cast(attrs, [:dj_instagram, :dj_tiktok, :dj_soundcloud, :dj_genres, :dj_handles, :bio, :avatar_url])
    |> validate_length(:bio, max: 500)
    |> validate_dj_handles()
  end

  defp validate_dj_handles(changeset) do
    case get_change(changeset, :dj_handles) do
      nil ->
        changeset

      handles when is_list(handles) ->
        valid =
          Enum.all?(handles, fn h ->
            is_map(h) and
              is_binary(Map.get(h, "platform", "")) and
              is_binary(Map.get(h, "handle", "")) and
              String.length(Map.get(h, "platform", "")) > 0 and
              String.length(Map.get(h, "handle", "")) > 0
          end)

        if valid,
          do: changeset,
          else: add_error(changeset, :dj_handles, "each handle must have a platform and handle value")

      _ ->
        add_error(changeset, :dj_handles, "must be a list")
    end
  end

  def device_location_changeset(user, attrs) do
    user
    |> cast(attrs, [:device_lat, :device_lng, :device_location_at])
    |> validate_required([:device_lat, :device_lng, :device_location_at])
    |> validate_number(:device_lat, greater_than_or_equal_to: -90, less_than_or_equal_to: 90)
    |> validate_number(:device_lng, greater_than_or_equal_to: -180, less_than_or_equal_to: 180)
  end
end
