defmodule Backend.Guardian.AuthErrorHandler do
  @moduledoc """
  Handles authentication errors for Guardian.
  """
  import Plug.Conn
  use BackendWeb, :controller

  @behaviour Guardian.Plug.ErrorHandler

  @impl Guardian.Plug.ErrorHandler
  def auth_error(conn, {_type, _reason}, _opts) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: BackendWeb.ErrorJSON)
    |> render(:"401")
  end
end
