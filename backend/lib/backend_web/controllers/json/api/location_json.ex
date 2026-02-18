defmodule BackendWeb.API.LocationJSON do
  @moduledoc """
  JSON views for Location API responses.
  """

  @doc """
  Renders a list of location search results.
  """
  def search(%{locations: locations}) do
    %{locations: Enum.map(locations, &data/1)}
  end

  defp data(location) do
    %{
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }
  end
end
