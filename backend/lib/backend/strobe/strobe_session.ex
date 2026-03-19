defmodule Backend.Strobe.StrobeSession do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @effects ~w(pulse kick half bar stutter wave custom)
  @statuses ~w(active stopped)

  @required_fields [:dj_user_id, :club_id, :bpm, :effect, :started_at]
  @optional_fields [:status, :custom_on_ms, :custom_off_ms]
  @all_fields @required_fields ++ @optional_fields

  schema "strobe_sessions" do
    field :bpm, :integer, default: 120
    field :effect, :string, default: "beat"
    field :status, :string, default: "active"
    field :started_at, :utc_datetime
    field :custom_on_ms, :integer
    field :custom_off_ms, :integer

    belongs_to :dj_user, User, foreign_key: :dj_user_id
    belongs_to :club, Club

    timestamps()
  end

  def changeset(session, attrs) do
    session
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:effect, @effects)
    |> validate_inclusion(:status, @statuses)
    |> validate_number(:bpm, greater_than: 0, less_than_or_equal_to: 300)
    |> foreign_key_constraint(:dj_user_id)
    |> foreign_key_constraint(:club_id)
  end

  def effects, do: @effects
end
