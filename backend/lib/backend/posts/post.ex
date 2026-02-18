defmodule Backend.Posts.Post do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @status_values ~w(pending approved rejected)
  @media_types ~w(image video)

  schema "posts" do
    field :caption, :string
    field :media_type, :string
    field :media_url, :string
    field :status, :string, default: "pending"
    field :club_approved_at, :naive_datetime

    belongs_to :user, Backend.Accounts.User
    belongs_to :club, Backend.Clubs.Club
    has_many :assets, Backend.Assets.Asset
    has_many :likes, Backend.Posts.PostLike

    timestamps()
  end

  # Media fields can be optional now since we use assets table for multiple media
  # user_id is optional to allow admin posts (club official content without user)
  @required_fields [:club_id]
  @optional_fields [:user_id, :caption, :status, :media_type, :media_url, :club_approved_at]
  @all_fields @required_fields ++ @optional_fields

  def changeset(post \\ %__MODULE__{}, attrs) do
    post
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:status, @status_values)
    |> validate_inclusion(:media_type, @media_types, allow_nil: true)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:club_id)
  end
end
