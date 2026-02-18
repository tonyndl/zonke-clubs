defmodule Backend.Messenger.ThreadParticipant do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Messenger.Thread

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @required_fields [:thread_id, :user_id]
  @optional_fields [:last_read_at]
  @all_fields @required_fields ++ @optional_fields

  schema "thread_participants" do
    field :thread_id, :binary_id
    field :user_id, :binary_id
    field :last_read_at, :utc_datetime

    belongs_to :thread, Thread, define_field: false
    belongs_to :user, User, define_field: false

    timestamps()
  end

  def changeset(thread_participant, attrs) do
    thread_participant
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> foreign_key_constraint(:thread_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint([:thread_id, :user_id])
  end
end
