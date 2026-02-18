defmodule BackendWeb.Admin.AdminController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Admin.Registration
  alias Backend.Admin.Admins
  alias Backend.Admin.Events
  alias Backend.Guardian
  alias Backend.Posts
  alias Backend.Clubs

  @doc """
  Admin registration endpoint.
  Creates a new admin account and returns JWT token.
  """
  def create(conn, params, _session) do
    with {:ok, admin} <- Registration.register_admin(params),
         {:ok, jwt, _claims} <- Guardian.encode_and_sign(admin, %{role: "admin"}, token_type: :access) do
      conn
      |> put_status(:created)
      |> render(:show_with_token, admin: admin, jwt: jwt)
    end
  end

  @doc """
  Get current admin profile.
  """
  def show(conn, _params, session) do
    conn
    |> put_status(:ok)
    |> render(:show, admin: session)
  end

  @doc """
  Update admin profile.
  """
  def update(conn, params, session) do
    with {:ok, admin} <- Admins.update_profile(session, params) do
      conn
      |> put_status(:ok)
      |> render(:show, admin: admin)
    end
  end

  @doc """
  Change admin password.
  """
  def change_password(conn, params, session) do
    with {:ok, _admin} <- Admins.change_password(session, params) do
      conn
      |> put_status(:ok)
      |> render(:password_changed, message: "Password changed successfully")
    end
  end

  @doc """
  Get dashboard statistics for the admin's club.
  """
  def dashboard_stats(conn, _params, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id) do
      # Get post statistics
      post_stats = Posts.get_dashboard_stats(club.id)

      # Get club favorites count
      favorites_count = Clubs.get_club_favorites_count(club.id)

      # Get upcoming events count
      upcoming_events_count = Events.count_upcoming_events(session)

      stats = Map.merge(post_stats, %{
        club_favorites: favorites_count,
        upcoming_events: upcoming_events_count
      })

      conn
      |> put_status(:ok)
      |> json(stats)
    end
  end
end
