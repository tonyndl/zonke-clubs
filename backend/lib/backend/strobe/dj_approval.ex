defmodule Backend.Strobe.DJApproval do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses ~w(pending approved)

  @required_fields [:dj_user_id, :club_id, :status]
  @optional_fields [:approved_by, :expires_at]
  @all_fields @required_fields ++ @optional_fields

  schema "dj_strobe_approvals" do
    field :status, :string, default: "pending"
    field :expires_at, :utc_datetime

    belongs_to :dj_user, User, foreign_key: :dj_user_id
    belongs_to :club, Club
    belongs_to :approver, User, foreign_key: :approved_by

    timestamps()
  end

  def changeset(approval, attrs) do
    approval
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:status, @statuses)
    |> foreign_key_constraint(:dj_user_id)
    |> foreign_key_constraint(:club_id)
    |> foreign_key_constraint(:approved_by)
    |> unique_constraint([:dj_user_id, :club_id], name: :unique_active_dj_strobe_approval)
  end
end
