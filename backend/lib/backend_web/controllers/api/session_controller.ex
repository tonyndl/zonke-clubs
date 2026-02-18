defmodule BackendWeb.API.SessionController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.Session

  @doc """
  Login endpoint.
  Accepts username and password, returns user and JWT token.
  """
  def create(conn, params, _session) do
    with {:ok, session_data} <- Session.authenticate(params) do
      conn
      |> put_status(:ok)
      |> render(:show, session: session_data)
    end
  end
end
