defmodule BackendWeb.Admin.SessionController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Admin.Session

  @doc """
  Admin login endpoint.
  Accepts email and password, returns admin and JWT token.
  """
  def create(conn, params, _session) do
    with {:ok, session_data} <- Session.authenticate(params) do
      conn
      |> put_status(:ok)
      |> render(:show, session: session_data)
    end
  end
end
