defmodule BackendWeb.Applications.VehicleApplicationController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Applications.VehicleApplications

  def index(conn, params, _session) do
    with {:ok, vehicle_applications, paginate} <-
           VehicleApplications.get_vehicle_applications(params) do
      render(conn, :index, %{vehicle_applications: vehicle_applications, paginate: paginate})
    end
  end

  # def index(conn, params, session) do
  #   with vehicle_applications <-
  #          VehicleApplications.get_vehicle_applications(params, session, :owner) do
  #     render(conn, :index, %{vehicle_applications: vehicle_applications})
  #   end
  # end

  def create(conn, params, session) do
    case VehicleApplications.create(params, session) do
      {:ok, vehicle_application} ->
        json(conn, %{status: "ok"})

      {:error, :no_driver_profile} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "no_driver_profile"})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Invalid data", details: changeset})
    end
  end

  def show(conn, %{id: id}, _session) do
    with {:ok, vehicle_application} <- VehicleApplications.get_vehicle_application(id) do
      render(conn, :show, %{vehicle_application: vehicle_application})
    end
  end

  def update(conn, %{id: id} = params, _session) do
    with {:ok, vehicle_application} <- VehicleApplications.get_vehicle_application(id),
         {:ok, vehicle_application} <- VehicleApplications.update(vehicle_application, params) do
      render(conn, :show, %{vehicle_application: vehicle_application})
    end
  end

  def delete(conn, %{id: id}, _session) do
    with {:ok, vehicle_application} <- VehicleApplications.get_vehicle_application(id),
         {:ok, _vehicle_application} <- VehicleApplications.delete(vehicle_application) do
      json(conn, :ok)
    end
  end

  def set_seen_true(conn, %{id: id}, _session) do
    with {:ok, _count} <- VehicleApplications.set_va_seen_true(id) do
      json(conn, %{status: "ok"})
    end
  end
end
