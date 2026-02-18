defmodule BackendWeb.API.LocationController do
  @moduledoc """
  Controller for location search and geocoding operations.
  Provides a proxy endpoint to Geoapify API to keep API keys secure.
  """
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Locations.Geoapify

  @doc """
  Search for location suggestions.
  Public endpoint that requires a query parameter.

  Query params:
    - q: Search query (minimum 3 characters required)

  Returns a list of location suggestions with name, latitude, and longitude.
  """
  def search(conn, %{"q" => query}, _session) when is_binary(query) do
    api_key = Application.get_env(:backend, :geoapify_api_key)

    cond do
      is_nil(api_key) or api_key == "" ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Location service not configured"})

      byte_size(query) < 3 ->
        conn
        |> put_status(:ok)
        |> render(:search, locations: [])

      true ->
        with {:ok, locations} <- Geoapify.search_places(query, api_key) do
          conn
          |> put_status(:ok)
          |> render(:search, locations: locations)
        end
    end
  end

  def search(conn, _params, _session) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Query parameter 'q' is required"})
  end
end
