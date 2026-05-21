defmodule BackendWeb.API.DJProfileController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.DJs

  @doc "List all DJ users. Optionally search by username via ?q=query."
  def index(conn, params, _session) do
    query = Map.get(params, "q", "")
    djs = DJs.search_dj_users(query)

    conn
    |> put_status(:ok)
    |> render(:index, djs: djs)
  end

  @doc "Get a single DJ user's public profile."
  def show(conn, %{"id" => id}, _session) do
    with {:ok, dj} <- DJs.get_dj_user(id) do
      conn
      |> put_status(:ok)
      |> render(:show, dj: dj)
    end
  end

  @doc "Returns all schedules (gigs) where the authenticated DJ user is booked."
  def my_schedules(conn, _params, session) do
    schedules = DJs.list_dj_user_schedules(session.id)

    conn
    |> put_status(:ok)
    |> render(:my_schedules, schedules: schedules)
  end

  @doc "DJ user updates their own profile. Requires role=dj."
  def update_me(conn, params, session) do
    with {:ok, updated} <- DJs.update_dj_profile(session, params) do
      conn
      |> put_status(:ok)
      |> render(:show, dj: updated)
    end
  end
end
