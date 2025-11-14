defmodule BackendWeb.Applications.DriverBookingJSON do
  def index(%{driver_bookings: driver_bookings, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(driver_booking <- driver_bookings, do: show(%{driver_booking: driver_booking}))
    }
  end

  def index(%{driver_bookings: driver_bookings}) do
    for(driver_booking <- driver_bookings, do: show(%{driver_booking: driver_booking}))
  end

  def show(%{driver_booking: driver_booking}) do
    Map.take(driver_booking, [
      :id,
      :status,
      :note,
      :booked_date,
      :price_fixed,
      :duration,
      :inserted_at,
      :updated_at
    ])
  end
end
