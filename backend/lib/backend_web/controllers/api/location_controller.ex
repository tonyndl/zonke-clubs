defmodule BackendWeb.API.LocationController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.Users

  def update_device(conn, %{"latitude" => lat, "longitude" => lng}, session) do
    with {:ok, _user} <- Users.update_device_location(session, lat, lng) do
      conn
      |> put_status(:ok)
      |> render(:ok)
    end
  end
end
