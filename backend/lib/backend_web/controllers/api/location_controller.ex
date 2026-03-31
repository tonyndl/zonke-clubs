defmodule BackendWeb.API.LocationController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.Users
  alias Backend.Locations.Geoapify

  def update_device(conn, %{"latitude" => lat, "longitude" => lng}, session) do
    with {:ok, _user} <- Users.update_device_location(session, lat, lng) do
      conn
      |> put_status(:ok)
      |> render(:ok)
    end
  end

  def search(conn, %{"q" => query}, _session) do
    api_key = Application.get_env(:backend, :geoapify_api_key, "")

    with {:ok, locations} <- Geoapify.search_places(query, api_key) do
      conn
      |> put_status(:ok)
      |> render(:search, locations: locations)
    end
  end
end
