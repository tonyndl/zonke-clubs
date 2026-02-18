defmodule Backend.Messenger.Thread do
  use Backend.Schema
  import Ecto.Changeset

  alias Backend.Messenger.{ThreadParticipant, Message}
  alias Backend.Connections.ConnectionRequest

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "threads" do
    has_many :thread_participants, ThreadParticipant
    has_many :messages, Message
    has_one :connection_request, ConnectionRequest

    timestamps()
  end

  def changeset(thread, attrs) do
    thread
    |> cast(attrs, [])
  end
end
