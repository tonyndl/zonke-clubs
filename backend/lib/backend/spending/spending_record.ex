defmodule Backend.Spending.SpendingRecord do
  use Backend.Schema
  import Ecto.Changeset

  @required_fields [:club_id, :user_id, :amount, :visit_date]
  @optional_fields [:notes, :group_outing_id, :paid_by_user_id, :split_type, :original_amount, :participant_ids]
  @all_fields @required_fields ++ @optional_fields

  @split_type_values ["equal", "custom"]

  schema "spending_records" do
    belongs_to :club, Backend.Clubs.Club
    belongs_to :user, Backend.Accounts.User
    belongs_to :paid_by, Backend.Accounts.User, foreign_key: :paid_by_user_id

    field :amount, :decimal
    field :visit_date, :date
    field :notes, :string

    # Group spending / bill splitting fields
    field :group_outing_id, Ecto.UUID
    field :split_type, :string
    field :original_amount, :decimal
    field :participant_ids, {:array, Ecto.UUID}, default: []

    timestamps()
  end

  @doc """
  Changeset for creating/updating spending records.
  """
  def changeset(spending_record \\ %__MODULE__{}, attrs) do
    spending_record
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_number(:amount, greater_than: 0)
    |> validate_inclusion(:split_type, @split_type_values)
    |> foreign_key_constraint(:club_id)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:paid_by_user_id)
  end
end
