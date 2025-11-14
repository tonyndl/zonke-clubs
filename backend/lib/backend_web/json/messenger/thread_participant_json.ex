defmodule BackendWeb.Messenger.ThreadParticipantJSON do
  alias BackendWeb.Messenger.ParticipantJSON

  def index(%{thread_participants: thread_participants}) do
    for thread_participant <- thread_participants,
        do: show(%{thread_participant: thread_participant})
  end

  def show(%{thread_participant: thread_participant}) do
    %{
      thread_id: thread_participant.thread_id,
      participant_id: thread_participant.participant_id,
      participant: ParticipantJSON.show(%{participant: thread_participant.participant})
    }
  end
end
