defmodule Backend.VehicleFactory do
  use ExMachina

  alias Backend.Vehicles.Vehicle

  defmacro __using__(_opts) do
    quote do
      def vehicle_factory do
        %Vehicle{
          id: Ecto.UUID.generate(),
          price_fixed: %{currency: "ZIG", value: 200},
          type: "taxi",
          user: build(:user)
        }
      end
    end
  end
end
