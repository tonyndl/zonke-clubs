defmodule Backend.MessageFactory do
  use ExMachina.Ecto

  alias Backend.Messenger.Schemas.Message

  defmacro __using__(_opts) do
    quote do
      def message_factory do
        %Message{
          id: Ecto.UUID.generate(),
          content: sequence(:content, &"Test message #{&1}"),
          seen: false,
          thread: build(:thread),
          visible: false,
          author: build(:participant),
          recipient: build(:participant)
        }
      end
    end
  end
end
