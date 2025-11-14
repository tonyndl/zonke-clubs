defmodule Backend.Messenger.Schemas.Thread do
  use Backend, :model

  alias Backend.Messenger.Schemas.{ThreadParticipant, Message}

  # @derive {Jason.Encoder, only: [:id]}

  schema "threads" do
    field(:last_message, :map, virtual: true)
    field(:unseen_msg_count, :integer, virtual: true)
    field(:recipient, :map, virtual: true)

    has_many(:thread_participants, ThreadParticipant)
    has_many(:messages, Message)

    timestamps()
  end

  def changeset(struct, attrs \\ %{}) do
    struct
    |> cast(attrs, [])
  end
end
