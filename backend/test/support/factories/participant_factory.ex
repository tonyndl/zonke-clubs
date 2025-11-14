defmodule Backend.ParticipantFactory do
  use ExMachina.Ecto

  alias Backend.TestExample.Participant

  defmacro __using__(_opts) do
    quote do
      def participant_factory do
        %Participant{
          id: Ecto.UUID.generate(),
          first_name: sequence(:first_name, &"First#{&1}"),
          last_name: sequence(:last_name, &"Last#{&1}"),
          email: sequence(:email, &"user#{&1}@example.com"),
          username: sequence(:username, &"user#{&1}"),
          location: %{"lat" => 0.0, "lng" => 0.0}
        }
      end
    end
  end
end
