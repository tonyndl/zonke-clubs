defmodule Backend.Checkins.ClubCheckin do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club

  @required_fields [:user_id, :club_id]
  @optional_fields [:is_open, :expires_at]
  @all_fields @required_fields ++ @optional_fields

  schema "club_checkins" do
    field :is_open, :boolean, default: true
    field :expires_at, :utc_datetime

    belongs_to :user, User
    belongs_to :club, Club

    timestamps()
  end

  def changeset(checkin, attrs) do
    checkin
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> unique_constraint([:user_id, :club_id])
  end
end
