defmodule Backend.ThreadFactory do
  use ExMachina.Ecto

  alias Backend.Messenger.Schemas.Thread

  defmacro __using__(_opts) do
    quote do
      def thread_factory do
        %Thread{
          id: Ecto.UUID.generate()
        }
      end
    end
  end
end
