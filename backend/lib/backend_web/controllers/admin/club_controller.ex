defmodule BackendWeb.Admin.ClubController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Clubs

  @doc """
  Setup or update admin's club profile.
  This is the initial setup after registration.
  """
  def setup(conn, params, session) do
    IO.puts("\n⏰ === CLUB SETUP REQUEST ===")
    IO.puts("Admin ID: #{session.id}")
    IO.puts("Params received:")
    IO.inspect(params, label: "Params")

    with {:ok, club} <- Clubs.setup_admin_club(session.id, params) do
      IO.puts("✅ Club updated successfully")
      IO.puts("Opening hours in DB:")
      IO.inspect(club.opening_hours, label: "Opening Hours")
      IO.puts("============================\n")

      conn
      |> put_status(:ok)
      |> render(:show, club: club)
    end
  end

  @doc """
  Get admin's club profile.
  """
  def show(conn, _params, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id) do
      conn
      |> put_status(:ok)
      |> render(:show, club: club)
    end
  end
end
