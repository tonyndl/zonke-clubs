defmodule BackendWeb.Bookings.DriverBookingController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Bookings.DriverBookings

  def index(conn, params, session) do
    with driver_bookings <- DriverBookings.get_driver_bookings(params, session, :driver) do
      render(conn, :index, driver_bookings: driver_bookings)
    end
  end

  def index(conn, params, session) do
    with driver_bookings <- DriverBookings.get_driver_bookings(params, session, :owner) do
      render(conn, :index, driver_bookings: driver_bookings)
    end
  end

  def create(conn, params, session) do
    with {:ok, driver_booking} <- DriverBookings.create(params, session) do
      render(conn, :show, driver_booking: driver_booking)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, driver_booking} <- DriverBookings.get_driver_booking(id) do
      render(conn, :show, driver_booking: driver_booking)
    end
  end

  def update(conn, %{id: id} = params, session) do
    with {:ok, driver_booking} <- DriverBookings.get_driver_booking(id),
         {:ok, driver_booking} <- DriverBookings.update(driver_booking, params) do
      render(conn, :show, driver_booking: driver_booking)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, driver_booking} <- DriverBookings.get_driver_booking(id),
         {:ok, _driver_booking} <- DriverBookings.delete(driver_booking) do
      json(conn, :ok)
    end
  end
end
