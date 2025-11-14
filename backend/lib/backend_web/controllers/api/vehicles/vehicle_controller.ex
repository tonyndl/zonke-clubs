defmodule BackendWeb.Vehicles.VehicleController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Vehicles.Vehicles
  alias BackendWeb.Vehicles.VehicleDriverJSON

  # TODO: add rate limiting
  def index_management_vehicle(conn, params, session) do
    with {:ok, vehicle_drivers, paginate} <-
           Vehicles.get_management_vehicles(params, session, :owner) do
      render(conn, VehicleDriverJSON, :index, %{
        vehicle_drivers: vehicle_drivers,
        paginate: paginate
      })
    end
  end

  def index_public(conn, params, _session) do
    with {:ok, vehicles, paginate} <- Vehicles.get_vehicles(params, :public) do
      render(conn, :index, %{vehicles: vehicles, paginate: paginate})
    end
  end

  def index(conn, params, session) do
    # with :ok <- Bodyguard.permit(Vehicles, :get_vehicles, %{id: profile_id}, session),
    with {:ok, vehicles, paginate} <- Vehicles.get_vehicles(params, session) do
      render(conn, :index, %{vehicles: vehicles, paginate: paginate})
    end
  end

  def create(conn, params, session) do
    # with :ok <- Bodyguard.permit(Vehicles, :create, %{id: profile_id}, session),
    with {:ok, vehicle} <- Vehicles.create(params, session) do
      render(conn, :show, vehicle: vehicle)
    end
  end

  def show_public(conn, %{id: id}, _session) do
    with {:ok, vehicle} <- Vehicles.get_vehicle(id, :public),
         :ok <- Bodyguard.permit(Vehicles, :show_public, vehicle, nil) do
      render(conn, :show, vehicle: vehicle)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, vehicle} <- Vehicles.get_vehicle(id) do
        #  :ok <- Bodyguard.permit(Vehicles, :show, vehicle, session) do
      render(conn, :show, %{vehicle: vehicle})
    end
  end

  def update_vehicle(conn, %{id: id} = params, session) do
    with {:ok, vehicle} <- Vehicles.get_vehicle(id),
        #  :ok <- Bodyguard.permit(Vehicles, :update, vehicle, session),
         {:ok, vehicle} <- Vehicles.update(vehicle, params) do
      render(conn, :show, vehicle: vehicle)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, vehicle} <- Vehicles.get_vehicle(id),
         :ok <- Bodyguard.permit(Vehicles, :delete, vehicle, session),
         {:ok, _driver} <- Vehicles.delete(vehicle) do
      json(conn, :ok)
    end
  end
end
