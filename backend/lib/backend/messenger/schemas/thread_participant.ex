defmodule Backend.Messenger.Schemas.ThreadParticipant do
  use Backend, :model

  alias Backend.Repo
  alias Backend.Messenger.Schemas.{Thread, Participant}

  # @derive {Jason.Encoder, only: [:id, :thread_id, :participant_id]}
  @params [:thread_id, :participant_id]

  schema "thread_participants" do
    belongs_to(:thread, Thread)
    belongs_to(:participant, Participant)

    timestamps()
  end

  def create(%Thread{id: thread_id}, participant_ids) do
    IO.inspect(participant_ids, label: "11111111111111111")
    uniq_participant_ids =
      participant_ids
      |> Enum.uniq()

    th_partis =
      Enum.map(uniq_participant_ids, fn participant_id ->
        %__MODULE__{thread_id: thread_id, participant_id: participant_id}
        |> changeset()
        |> Repo.insert()
      end)
  end

  def changeset(struct, attrs \\ %{}) do
    struct
    |> cast(attrs, @params)
    |> validate_required(@params)
    |> assoc_constraint(:thread)
    |> assoc_constraint(:participant)
    |> unique_constraint(:thread_participants, name: :unique_thread_participant_idx)
  end
end
