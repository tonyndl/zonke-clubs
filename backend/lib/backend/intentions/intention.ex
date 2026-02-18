defmodule Backend.Intentions.Intention do
  @moduledoc """
  Schema for user meetup intentions at clubs.
  """
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club

  @required_fields [:activity_type, :club_id, :user_id, :planned_date, :active]
  @optional_fields [:planned_time, :message, :expires_at]
  @all_fields @required_fields ++ @optional_fields

  @activity_types ["dancing_partner", "drinking_buddy", "new_friends", "open_to_anything"]

  schema "intentions" do
    field :activity_type, :string
    field :planned_date, :date
    field :planned_time, :string
    field :message, :string
    field :active, :boolean, default: true
    field :expires_at, :utc_datetime

    belongs_to :user, User
    belongs_to :club, Club

    timestamps()
  end

  @doc false
  def changeset(intention, attrs) do
    intention
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:activity_type, @activity_types)
    |> assoc_constraint(:user)
    |> assoc_constraint(:club)
  end
end
