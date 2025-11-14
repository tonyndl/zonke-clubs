defmodule Backend.VehicleDriverFactory do
  use ExMachina

  alias Backend.Vehicles.VehicleDriver

  defmacro __using__(_opts) do
    quote do
      def vehicle_driver_factory do
        %VehicleDriver{
          id: Ecto.UUID.generate(),
          driver: build(:driver),
          vehicle: build(:vehicle)
        }
      end
    end
  end
end
