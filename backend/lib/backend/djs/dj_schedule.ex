defmodule Backend.DJs.DJSchedule do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @required_fields [:type, :club_id]
  @optional_fields [:dj_id, :dj_user_id, :day_of_week, :start_time, :end_time, :notes, :specific_date]
  @all_fields @required_fields ++ @optional_fields

  schema "dj_schedules" do
    field :day_of_week, :integer
    field :start_time, :time
    field :end_time, :time
    field :notes, :string
    field :type, :string
    field :specific_date, :date

    belongs_to :dj, Backend.DJs.DJ
    belongs_to :dj_user, Backend.Accounts.User, foreign_key: :dj_user_id
    belongs_to :club, Backend.Clubs.Club

    timestamps()
  end

  def changeset(schedule, attrs) do
    schedule
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_dj_reference()
    |> validate_inclusion(:type, ["weekly", "specific"])
    |> validate_inclusion(:day_of_week, 0..6, message: "must be between 0 (Sunday) and 6 (Saturday)")
    |> validate_weekly_schedule()
    |> validate_specific_schedule()
  end

  defp validate_dj_reference(changeset) do
    dj_id = get_field(changeset, :dj_id)
    dj_user_id = get_field(changeset, :dj_user_id)

    if is_nil(dj_id) and is_nil(dj_user_id) do
      add_error(changeset, :dj_user_id, "a DJ must be specified (dj_id or dj_user_id)")
    else
      changeset
    end
  end

  defp validate_weekly_schedule(changeset) do
    type = get_field(changeset, :type)

    if type == "weekly" do
      validate_required(changeset, [:day_of_week])
    else
      changeset
    end
  end

  defp validate_specific_schedule(changeset) do
    type = get_field(changeset, :type)

    if type == "specific" do
      validate_required(changeset, [:specific_date])
    else
      changeset
    end
  end
end
