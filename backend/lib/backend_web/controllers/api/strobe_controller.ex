defmodule BackendWeb.API.StrobeController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Strobe

  # ── DJ endpoints ──────────────────────────────────────────────────────────────

  @doc "List DJ's approvals (pending + active)"
  def my_approvals(conn, _params, session) do
    approvals = Strobe.list_dj_approvals(session)

    conn
    |> put_status(:ok)
    |> render(:approvals, approvals: approvals)
  end

  @doc "DJ requests approval from a club"
  def request_approval(conn, %{"club_id" => club_id}, session) do
    with {:ok, approval} <- Strobe.request_approval(club_id, session) do
      conn
      |> put_status(:created)
      |> render(:approval, approval: approval)
    end
  end

  @doc "DJ cancels a pending approval request"
  def cancel_request(conn, %{"club_id" => club_id}, session) do
    with {:ok, _} <- Strobe.cancel_request(club_id, session) do
      conn
      |> put_status(:ok)
      |> render(:ok, %{})
    end
  end

  @doc "List DJ's active strobe sessions"
  def my_sessions(conn, _params, session) do
    sessions = Strobe.list_dj_sessions(session)

    conn
    |> put_status(:ok)
    |> render(:sessions, sessions: sessions)
  end

  # ── Club admin endpoints ───────────────────────────────────────────────────────

  @doc "Approve a DJ (club admin only)"
  def approve_dj(conn, %{"club_id" => club_id, "dj_user_id" => dj_user_id}, session) do
    with {:ok, approval} <- Strobe.approve_dj(club_id, dj_user_id, session) do
      conn
      |> put_status(:ok)
      |> render(:approval, approval: approval)
    end
  end

  @doc "Revoke a DJ's approval"
  def revoke_approval(conn, %{"club_id" => club_id, "dj_user_id" => dj_user_id}, session) do
    with {:ok, _} <- Strobe.revoke_approval(club_id, dj_user_id, session) do
      conn
      |> put_status(:ok)
      |> render(:ok, %{})
    end
  end

  @doc "List all currently active strobe sessions (audience discovery)"
  def active_sessions(conn, _params, _session) do
    sessions = Strobe.list_active_sessions()

    conn
    |> put_status(:ok)
    |> render(:active_sessions, sessions: sessions)
  end

  @doc "Get active strobe session for a club (audience discovery)"
  def active_session(conn, %{"club_id" => club_id}, _session) do
    session = Strobe.get_active_session(club_id)

    conn
    |> put_status(:ok)
    |> render(:active_session, session: session)
  end

  @doc "List all approvals for a club"
  def club_approvals(conn, %{"club_id" => club_id}, session) do
    approvals = Strobe.list_club_approvals(club_id, session)

    conn
    |> put_status(:ok)
    |> render(:approvals, approvals: approvals)
  end
end
