defmodule Backend.Admin.Event do
  use Backend.Schema
  import Ecto.Changeset

  @required_fields [
    :title,
    :description,
    :date,
    :start_time,
    :end_time,
    :general_entry_price,
    :vip_entry_price,
    :status,
    :admin_id
  ]

  @optional_fields [:dj_lineup, :cover_image]
  @all_fields @required_fields ++ @optional_fields

  @status_values ["draft", "published"]

  schema "events" do
    field :title, :string
    field :description, :string
    field :date, :date
    field :start_time, :string
    field :end_time, :string
    field :general_entry_price, :decimal
    field :vip_entry_price, :decimal
    field :dj_lineup, {:array, :string}, default: []
    field :cover_image, :string
    field :status, :string, default: "draft"

    belongs_to :admin, Backend.Admin.Admin

    timestamps()
  end

  @doc """
  Changeset for creating/updating an event.
  """
  def changeset(event, attrs) do
    event
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_length(:title, min: 3, max: 200)
    |> validate_length(:description, min: 10, max: 2000)
    |> validate_inclusion(:status, @status_values)
    |> validate_number(:general_entry_price, greater_than_or_equal_to: 0)
    |> validate_number(:vip_entry_price, greater_than_or_equal_to: 0)
    |> validate_date_not_in_past()
    |> validate_time_format(:start_time)
    |> validate_time_format(:end_time)
    |> foreign_key_constraint(:admin_id)
  end

  defp validate_date_not_in_past(changeset) do
    case get_field(changeset, :date) do
      nil ->
        changeset

      date ->
        if Date.compare(date, Date.utc_today()) == :lt do
          add_error(changeset, :date, "cannot be in the past")
        else
          changeset
        end
    end
  end

  defp validate_time_format(changeset, field) do
    case get_change(changeset, field) do
      nil ->
        changeset

      time_string ->
        case Time.from_iso8601(time_string <> ":00") do
          {:ok, _time} ->
            changeset

          {:error, _} ->
            add_error(changeset, field, "must be in HH:MM format")
        end
    end
  end
end
