defmodule BackendWeb.Plugs.SessionPlug do
  @moduledoc """
  Plug to inject current user as session parameter for authenticated routes.
  For public routes, session will be nil.
  """

  def init(opts), do: opts

  def call(conn, _opts) do
    # Get current_user from conn.assigns (set by Guardian pipeline)
    session = Map.get(conn.assigns, :current_user)

    # Store in private for BackendWeb to use when calling actions
    Plug.Conn.put_private(conn, :backend_session, session)
  end
end
