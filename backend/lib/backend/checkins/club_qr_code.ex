defmodule Backend.Checkins.ClubQRCode do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Clubs.Club

  @required_fields [:token, :club_id, :valid_date, :expires_at]
  @optional_fields [:label]
  @all_fields @required_fields ++ @optional_fields

  schema "club_qr_codes" do
    field :token, :string
    field :label, :string
    field :valid_date, :date
    field :expires_at, :utc_datetime

    belongs_to :club, Club

    timestamps()
  end

  def changeset(qr, attrs) do
    qr
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> unique_constraint(:token)
  end
end
