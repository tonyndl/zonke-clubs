defmodule Backend.AuthHelper do
  @moduledoc """
  Helper functions for authenticating users and admins in controller tests.

  Usage in controller tests:
    import Backend.AuthHelper

    test "authenticated endpoint", %{conn: conn} do
      user = insert(:user)
      conn = authenticate_user(conn, user)

      conn = get(conn, ~p"/api/profile")
      assert json_response(conn, 200)
    end
  """

  import Backend.Factory
  alias Backend.Guardian

  @doc """
  Authenticates a user by generating a JWT token and adding it to the connection.
  If no user is provided, creates one automatically.
  """
  def authenticate_user(conn, user \\ nil) do
    user = user || insert(:user)
    {:ok, token, _claims} = Guardian.encode_and_sign(user)
    Plug.Conn.put_req_header(conn, "authorization", "Bearer #{token}")
  end

  @doc """
  Authenticates an admin by generating a JWT token and adding it to the connection.
  If no admin is provided, creates one automatically.
  """
  def authenticate_admin(conn, admin \\ nil) do
    admin = admin || insert(:admin)
    {:ok, token, _claims} = Guardian.encode_and_sign(admin)
    Plug.Conn.put_req_header(conn, "authorization", "Bearer #{token}")
  end

  @doc """
  Generates a JWT token for a user without modifying the connection.
  Useful for testing token validation.
  """
  def generate_user_token(user \\ nil) do
    user = user || insert(:user)
    {:ok, token, _claims} = Guardian.encode_and_sign(user)
    token
  end

  @doc """
  Generates a JWT token for an admin without modifying the connection.
  Useful for testing token validation.
  """
  def generate_admin_token(admin \\ nil) do
    admin = admin || insert(:admin)
    {:ok, token, _claims} = Guardian.encode_and_sign(admin)
    token
  end
end
