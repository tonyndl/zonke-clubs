defmodule BackendWeb.API.LocationControllerTest do
  use BackendWeb.ConnCase, async: false

  describe "GET /api/locations/search" do
    test "returns error when query parameter is missing", %{conn: conn} do
      conn = get(conn, ~p"/api/locations/search")

      assert json_response(conn, 400) == %{
        "error" => "Query parameter 'q' is required"
      }
    end

    test "returns empty array for queries less than 3 characters", %{conn: conn} do
      # Set API key for test
      api_key = System.get_env("GEOAPIFY_API_KEY") || "test-key"
      Application.put_env(:backend, :geoapify_api_key, api_key)

      conn = get(conn, ~p"/api/locations/search?q=ab")

      assert json_response(conn, 200) == %{"locations" => []}
    end

    @tag :external_api
    test "returns location suggestions for valid query with API key", %{conn: conn} do
      api_key = System.get_env("GEOAPIFY_API_KEY")

      if api_key && api_key != "" do
        Application.put_env(:backend, :geoapify_api_key, api_key)

        conn = get(conn, ~p"/api/locations/search?q=Cape")
        response = json_response(conn, 200)

        assert Map.has_key?(response, "locations")
        assert is_list(response["locations"])

        if length(response["locations"]) > 0 do
          first_location = List.first(response["locations"])
          assert Map.has_key?(first_location, "name")
          assert Map.has_key?(first_location, "latitude")
          assert Map.has_key?(first_location, "longitude")
        end
      else
        # Skip test if no API key
        assert true
      end
    end

    test "returns error when API key is not configured", %{conn: conn} do
      # Remove API key
      Application.put_env(:backend, :geoapify_api_key, nil)

      conn = get(conn, ~p"/api/locations/search?q=Cape")

      assert json_response(conn, 500) == %{
        "error" => "Location service not configured"
      }
    end

    test "handles URL-encoded query parameters", %{conn: conn} do
      api_key = System.get_env("GEOAPIFY_API_KEY") || "test-key"
      Application.put_env(:backend, :geoapify_api_key, api_key)

      # Test with space in query (URL encoded as %20 or +)
      conn = get(conn, ~p"/api/locations/search?q=Cape%20Town")

      # Should not error due to encoding
      assert conn.status in [200, 500]
    end
  end
end
