defmodule Backend.Clubs.Club do
  @moduledoc """
  Schema for nightclubs and venues.
  """
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Admin.Admin
  alias Backend.Assets.Asset
  alias Backend.Clubs.ClubLike

  @required_fields [:name, :description, :location]
  @optional_fields [:email, :phone, :active, :dress_code, :entry_fee, :user_id, :admin_id, :opening_hours, :next_week_hours, :table_reservation_numbers, :banner_position_x, :banner_position_y]
  @all_fields @required_fields ++ @optional_fields

  schema "clubs" do
    field :name, :string
    field :email, :string
    field :phone, :string
    field :description, :string
    field :location, :map
    field :active, :boolean, default: true
    field :dress_code, :string
    field :entry_fee, :string
    field :opening_hours, :map, default: %{}
    field :next_week_hours, :map, default: %{}
    field :table_reservation_numbers, {:array, :string}, default: []
    field :banner_position_x, :float, default: 50.0
    field :banner_position_y, :float, default: 50.0
    field :is_liked, :boolean, virtual: true
    field :banner_image_url, :string, virtual: true

    belongs_to :user, User
    belongs_to :admin, Admin
    has_one :asset, Asset
    has_many :club_likes, ClubLike

    timestamps()
  end

  @doc false
  def changeset(club, attrs) do
    club
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_location()
    |> validate_owner()
    |> unique_constraint(:name)
  end

  # Validates location map structure
  defp validate_location(changeset) do
    case get_change(changeset, :location) do
      nil ->
        # If no change, check if existing value is valid (for updates)
        case get_field(changeset, :location) do
          nil -> changeset
          location when is_map(location) -> changeset
          _ -> add_error(changeset, :location, "must be a map")
        end

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

  # Ensure club has either user_id or admin_id, but not both or neither
  defp validate_owner(changeset) do
    user_id = get_field(changeset, :user_id)
    admin_id = get_field(changeset, :admin_id)

    cond do
      is_nil(user_id) and is_nil(admin_id) ->
        add_error(changeset, :base, "Club must have either a user or admin owner")

      not is_nil(user_id) and not is_nil(admin_id) ->
        add_error(changeset, :base, "Club cannot have both user and admin owners")

      true ->
        changeset
    end
  end
end
