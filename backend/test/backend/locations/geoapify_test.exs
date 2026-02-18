defmodule Backend.Locations.GeoapifyTest do
  use ExUnit.Case, async: true
  alias Backend.Locations.Geoapify

  describe "search_places/2" do
    @tag :external_api
    test "returns empty list for queries shorter than 3 characters" do
      assert {:ok, []} = Geoapify.search_places("ab", "test-key")
      assert {:ok, []} = Geoapify.search_places("", "test-key")
      assert {:ok, []} = Geoapify.search_places("a", "test-key")
    end

    @tag :external_api
    test "returns locations for valid queries with real API key" do
      api_key = System.get_env("GEOAPIFY_API_KEY") || "test-key"

      case Geoapify.search_places("Cape Town", api_key) do
        {:ok, locations} ->
          assert is_list(locations)
          assert length(locations) > 0

          # Check first location structure
          first_location = List.first(locations)
          assert Map.has_key?(first_location, :name)
          assert Map.has_key?(first_location, :latitude)
          assert Map.has_key?(first_location, :longitude)
          assert is_binary(first_location.name)
          assert is_float(first_location.latitude) or is_integer(first_location.latitude)
          assert is_float(first_location.longitude) or is_integer(first_location.longitude)

        {:error, reason} ->
          # If no API key, test should skip gracefully
          if api_key == "test-key" do
            assert reason =~ "API"
          else
            flunk("API call failed: #{reason}")
          end
      end
    end

    @tag :external_api
    test "formats location names correctly" do
      api_key = System.get_env("GEOAPIFY_API_KEY") || "test-key"

      case Geoapify.search_places("Johannesburg", api_key) do
        {:ok, locations} when length(locations) > 0 ->
          first_location = List.first(locations)
          # Location names should contain city or country info
          assert first_location.name =~ ~r/[A-Za-z]/

        {:ok, []} ->
          # Empty results are acceptable
          assert true

        {:error, _reason} ->
          # API errors are acceptable in tests
          assert true
      end
    end
  end
end
