defmodule Backend.DJs.DJ do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @required_fields [:name, :club_id]
  @optional_fields [:genre, :bio, :instagram, :tiktok, :soundcloud, :image_url]
  @all_fields @required_fields ++ @optional_fields

  schema "djs" do
    field :name, :string
    field :genre, :string
    field :bio, :string
    field :instagram, :string
    field :tiktok, :string
    field :soundcloud, :string
    field :image_url, :string

    belongs_to :club, Backend.Clubs.Club
    has_many :schedules, Backend.DJs.DJSchedule

    timestamps()
  end

  def changeset(dj, attrs) do
    dj
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_length(:name, min: 1, max: 255)
    |> validate_length(:bio, max: 1000)
  end
end
