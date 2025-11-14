defmodule Backend.DriverBookingFactory do
  use ExMachina

  alias Backend.Bookings.DriverBooking

  defmacro __using__(_opts) do
    quote do
      def driver_booking_factory do
        %DriverBooking{
          id: Ecto.UUID.generate(),
          user: build(:user),
          driver: build(:driver)
        }
      end
    end
  end
end
