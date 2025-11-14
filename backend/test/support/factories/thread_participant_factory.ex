defmodule Backend.ThreadParticipantFactory do
  use ExMachina.Ecto

  alias Backend.Messenger.Schemas.ThreadParticipant

  defmacro __using__(_opts) do
    quote do
      def thread_participant_factory do
        %ThreadParticipant{
          id: Ecto.UUID.generate(),
          thread: build(:thread),
          participant: build(:participant)
        }
      end
    end
  end
end
