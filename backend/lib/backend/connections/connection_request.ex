defmodule Backend.Connections.ConnectionRequest do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Clubs.Club
  alias Backend.Intentions.Intention
  alias Backend.Messenger.Thread

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @required_fields [:sender_id, :receiver_id, :status]
  @optional_fields [:message, :club_id, :intention_id, :thread_id]
  @all_fields @required_fields ++ @optional_fields

  schema "connection_requests" do
    field :status, :string, default: "pending"
    field :message, :string

    belongs_to :sender, User
    belongs_to :receiver, User
    belongs_to :club, Club
    belongs_to :intention, Intention
    belongs_to :thread, Thread

    timestamps()
  end

  def changeset(request, attrs) do
    request
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:status, ["pending", "accepted", "declined"])
    |> foreign_key_constraint(:sender_id)
    |> foreign_key_constraint(:receiver_id)
    |> foreign_key_constraint(:club_id)
    |> foreign_key_constraint(:intention_id)
    |> foreign_key_constraint(:thread_id)
    |> unique_constraint([:sender_id, :receiver_id, :intention_id],
      name: :unique_active_connection_requests,
      message: "You already have an active connection request with this person"
    )
    |> unique_constraint(:thread_id,
      name: :unique_thread_id_on_connection_requests,
      message: "This thread is already associated with a connection request"
    )
  end
end
