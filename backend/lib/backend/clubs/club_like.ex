defmodule Backend.Clubs.ClubLike do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "club_likes" do
    belongs_to :user, User
    belongs_to :club, Club

    timestamps()
  end

  @required_fields [:user_id, :club_id]
  @all_fields @required_fields

  def changeset(club_like, attrs) do
    club_like
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> assoc_constraint(:user)
    |> assoc_constraint(:club)
    |> unique_constraint([:user_id, :club_id], name: :club_likes_user_id_club_id_index)
  end
end
