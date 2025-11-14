defmodule BackendWeb.SessionControllerTest do
  use BackendWeb.ConnCase, async: true

  describe "create/2" do
    test "returns 401 for invalid credentials", %{conn: conn} do
      params = %{"email" => "nonexistent@example.com", "password" => "wrong"}

      conn = post(conn, Routes.session_path(conn, :create), params)

      assert json_response(conn, 401)
      assert %{"error" => error_msg} = json_response(conn, 401)
      assert error_msg in ["Invalid email or password", "unauthorized"]
    end
  end
end
