defmodule Backend.BusinessProfileFactory do
  use ExMachina

  alias Backend.Accounts.BusinessProfile

  defmacro __using__(_opts) do
    quote do
      def business_profile_factory do
        %BusinessProfile{
          id: Ecto.UUID.generate(),
          description: "I am a hair dresser",
          name: sequence(:name, &"Test Business #{&1}"),
          user: build(:user),
          location: %{"lat" => 0.0, "lng" => 0.0},
          active: true
        }
      end
    end
  end
end
