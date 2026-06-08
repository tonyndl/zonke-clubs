defmodule BackendWeb.API.CheckinController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Checkins

  @doc "Check in to a club (creates or refreshes the check-in)."
  def checkin(conn, %{"club_id" => club_id}, session) do
    with {:ok, checkin} <- Checkins.checkin(club_id, session) do
      conn
      |> put_status(:ok)
      |> render(:checkin, checkin: checkin)
    end
  end

  @doc "Check out of a club (removes the check-in)."
  def checkout(conn, %{"club_id" => club_id}, session) do
    with {:ok, _} <- Checkins.checkout(club_id, session) do
      conn
      |> put_status(:ok)
      |> json(%{message: "Checked out"})
    end
  end

  @doc "Update open/closed status on an existing check-in."
  def update(conn, %{"club_id" => club_id, "is_open" => is_open}, session) do
    with {:ok, checkin} <- Checkins.set_open(club_id, session, is_open) do
      conn
      |> put_status(:ok)
      |> render(:checkin, checkin: checkin)
    end
  end

  @doc "Get current user's check-in status for this club."
  def my_checkin(conn, %{"club_id" => club_id}, session) do
    {:ok, checkin} = Checkins.get_my_checkin(club_id, session)

    conn
    |> put_status(:ok)
    |> render(:my_checkin, checkin: checkin)
  end

  @doc "List users who are open at this club right now."
  def open_users(conn, %{"club_id" => club_id}, session) do
    checkins = Checkins.list_open_users(club_id, session)

    conn
    |> put_status(:ok)
    |> render(:open_users, checkins: checkins)
  end

  # ── QR Code management (admin) ────────────────────────────────────────────────

  @doc "Generate a new QR code for a gig. Admin only."
  def create_qr(conn, %{"club_id" => club_id} = params, _session) do
    attrs = Map.take(params, ["label", "valid_date", "expires_at"])

    with {:ok, qr} <- Checkins.generate_qr_code(club_id, attrs) do
      conn
      |> put_status(:created)
      |> render(:qr_code, qr: qr)
    end
  end

  @doc "List all QR codes for the admin's club."
  def list_qr(conn, %{"club_id" => club_id}, _session) do
    codes = Checkins.list_club_qr_codes(club_id)

    conn
    |> put_status(:ok)
    |> render(:qr_codes, codes: codes)
  end

  @doc "Delete a QR code."
  def delete_qr(conn, %{"club_id" => club_id, "id" => id}, _session) do
    with {:ok, _} <- Checkins.delete_qr_code(id, club_id) do
      conn
      |> put_status(:ok)
      |> json(%{message: "QR code deleted"})
    end
  end

  @doc "Public: check if a club has an active QR code valid for today."
  def active_qr(conn, %{"club_id" => club_id}, _session) do
    active = Checkins.has_active_qr_code?(club_id)

    conn
    |> put_status(:ok)
    |> render(:active_qr, active: active)
  end

  @doc "Public: validate a QR token and return club info. Called by the mobile scanner."
  def validate_qr(conn, %{"token" => token}, _session) do
    with {:ok, qr} <- Checkins.get_qr_by_token(token) do
      conn
      |> put_status(:ok)
      |> render(:qr_valid, qr: qr)
    end
  end
end
