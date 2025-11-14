defmodule Backend.VehicleBookingFactory do
  use ExMachina

  alias Backend.Bookings.VehicleBooking

  defmacro __using__(_opts) do
    quote do
      def vehicle_booking_factory do
        %VehicleBooking{
          id: Ecto.UUID.generate(),
          user: build(:user),
          vehicle: build(:vehicle)
        }
      end
    end
  end
end
