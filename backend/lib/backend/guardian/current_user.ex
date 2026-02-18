defmodule Backend.Guardian.CurrentUser do
  @moduledoc """
  Plug to load the current user or admin from Guardian claims and add it to conn.assigns.
  This makes the full user/admin struct available as the session parameter in controllers.

  Options:
  - halt_on_error: if true (default), returns 401 when user/admin not found. If false, continues without user.
  """
  import Plug.Conn

  alias Backend.Accounts.Users
  alias Backend.Admin.Admins

  def init(opts), do: opts

  def call(conn, opts) do
    halt_on_error = Keyword.get(opts, :halt_on_error, true)

    case Guardian.Plug.current_claims(conn) do
      %{"sub" => "User:" <> user_id_string} ->
        # Cast the UUID string to proper binary format
        with {:ok, user_id} <- Ecto.UUID.cast(user_id_string),
             {:ok, user} <- Users.get_user_by(id: user_id) do
          assign(conn, :current_user, user)
        else
          _ ->
            if halt_on_error do
              conn
              |> put_status(:unauthorized)
              |> Phoenix.Controller.json(%{error: "User not found"})
              |> halt()
            else
              # For optional auth, just continue without setting current_user
              conn
            end
        end

      %{"sub" => "Admin:" <> admin_id_string} ->
        # Cast the UUID string to proper binary format
        with {:ok, admin_id} <- Ecto.UUID.cast(admin_id_string),
             {:ok, admin} <- Admins.get_admin_by(id: admin_id) do
          assign(conn, :current_user, admin)
        else
          _ ->
            if halt_on_error do
              conn
              |> put_status(:unauthorized)
              |> Phoenix.Controller.json(%{error: "Admin not found"})
              |> halt()
            else
              conn
            end
        end

      _ ->
        conn
    end
  end
end
