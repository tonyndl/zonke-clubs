defmodule Backend.Locations.Geoapify do
  @moduledoc """
  Geoapify API client for location autocomplete and geocoding.
  Uses the Geoapify autocomplete API to search for locations worldwide.
  """

  require Logger

  @api_url "https://api.geoapify.com/v1/geocode/autocomplete"
  @results_limit 5

  @doc """
  Searches for location suggestions using Geoapify autocomplete API.
  Returns list of location maps with name, latitude, and longitude.

  ## Parameters
    - query: Search string (minimum 3 characters)
    - api_key: Geoapify API key

  ## Returns
    - {:ok, locations} where locations is a list of maps with :name, :latitude, :longitude
    - {:error, reason} on failure

  ## Examples
      iex> Geoapify.search_places("Cape Town", "api-key")
      {:ok, [%{name: "Cape Town, Western Cape, South Africa", latitude: -33.9249, longitude: 18.4241}]}
  """
  def search_places(query, _api_key) when byte_size(query) < 3 do
    {:ok, []}
  end

  def search_places(query, api_key) do
    url = build_url(query, api_key)

    case Req.get(url, receive_timeout: 5000) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        parse_response(body)

      {:ok, %Req.Response{status: status}} ->
        Logger.error("Geoapify API returned status #{status}")
        {:error, "Geoapify API error: status #{status}"}

      {:error, exception} ->
        Logger.error("Geoapify API request failed: #{inspect(exception)}")
        {:error, "Network error: #{Exception.message(exception)}"}
    end
  end

  defp build_url(query, api_key) do
    params =
      URI.encode_query(%{
        text: query,
        limit: @results_limit,
        apiKey: api_key,
        format: "json"
      })

    "#{@api_url}?#{params}"
  end

  defp parse_response(body) when is_map(body) do
    case Map.get(body, "results") do
      results when is_list(results) ->
        locations = Enum.map(results, &format_location/1)
        {:ok, locations}

      _ ->
        {:ok, []}
    end
  end

  defp parse_response(_), do: {:ok, []}

  defp format_location(result) do
    %{
      name: build_location_name(result),
      latitude: result["lat"],
      longitude: result["lon"]
    }
  end

  # Build readable location name from Geoapify result
  # Combines various location components into a human-readable string
  defp build_location_name(result) do
    parts = [
      result["name"],
      result["city"],
      result["state"],
      result["country"]
    ]

    parts
    |> Enum.reject(&is_nil/1)
    |> Enum.uniq()
    |> Enum.join(", ")
  end
end
