defmodule Backend.Messenger.Message do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Messenger.Thread

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @required_fields [:thread_id, :sender_id, :content]
  @optional_fields [:is_read, :status]
  @all_fields @required_fields ++ @optional_fields
  @valid_statuses ["sent", "delivered", "read"]

  schema "messages" do
    field :thread_id, :binary_id
    field :sender_id, :binary_id
    field :content, :string
    field :is_read, :boolean, default: false
    field :status, :string, default: "sent"

    belongs_to :thread, Thread, define_field: false, foreign_key: :thread_id
    belongs_to :sender, User, define_field: false, foreign_key: :sender_id

    timestamps()
  end

  def changeset(message, attrs) do
    message
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_length(:content, min: 1, max: 5000)
    |> validate_inclusion(:status, @valid_statuses)
    |> foreign_key_constraint(:thread_id)
    |> foreign_key_constraint(:sender_id)
  end
end
