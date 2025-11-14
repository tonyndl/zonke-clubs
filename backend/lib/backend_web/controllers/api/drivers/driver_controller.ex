defmodule BackendWeb.Drivers.DriverController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Drivers.Drivers

  # TODO: add rate limiting
  def index(conn, params, session) do
    # with :ok <- Bodyguard.permit(Drivers, :get_drivers, %{id: profile_id}, session),
    with {:ok, drivers, paginate} <- Drivers.get_drivers(params, session) do
      render(conn, :index, %{drivers: drivers, paginate: paginate})
    end
  end

  def public_index(conn, params, _session) do
    with {:ok, drivers, paginate} <- Drivers.get_drivers(params, :public) do
      render(conn, :index, %{drivers: drivers, paginate: paginate})
    end
  end

  def create(conn, params, session) do
    with {:ok, driver} <- Drivers.create(params, session) do
      render(conn, :show, driver: driver)
    end
  end

  def show_public(conn, %{id: id}, _session) do
    with {:ok, driver} <- Drivers.get_driver(id, :public) do
      render(conn, :show, driver: driver)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, driver} <- Drivers.get_driver(id) do
      render(conn, :show, driver: driver)
    end
  end

  def update(conn, %{id: id} = params, session) do
    with {:ok, driver} <- Drivers.get_driver(id),
         {:ok, driver} <- Drivers.update(driver, params) do
      render(conn, :show, driver: driver)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, driver} <- Drivers.get_driver(id),
         {:ok, _driver} <- Drivers.delete(driver) do
      json(conn, :ok)
    end
  end

  def upsert(conn, params, %{user_id: user_id}) do
    with {:ok, driver} <- Drivers.update_or_create(params, user_id) do
      render(conn, :show, driver: driver)
    end
  end

  def fetch_user_driver(conn, _params, %{user_id: user_id}) do
    with {:ok, driver} <- Drivers.get_user_driver(user_id) do
      render(conn, :show, driver: driver)
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Profile not found"})
    end
  end
end
