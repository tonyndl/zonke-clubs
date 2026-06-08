defmodule Backend.Checkins do
  @moduledoc """
  Context for managing club check-ins via QR code wristbands.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.Checkins.ClubCheckin
  alias Backend.Checkins.ClubQRCode

  @checkin_ttl_hours 12

  @doc "Check a user into a club (upsert). Sets expires_at to 12 h from now."
  def checkin(club_id, session) do
    expires_at =
      DateTime.utc_now()
      |> DateTime.add(@checkin_ttl_hours * 3600, :second)
      |> DateTime.truncate(:second)

    case Repo.get_by(ClubCheckin, user_id: session.id, club_id: club_id) do
      nil ->
        %ClubCheckin{}
        |> ClubCheckin.changeset(%{
          user_id: session.id,
          club_id: club_id,
          is_open: true,
          expires_at: expires_at
        })
        |> Repo.insert()

      existing ->
        existing
        |> ClubCheckin.changeset(%{is_open: true, expires_at: expires_at})
        |> Repo.update()
    end
  end

  @doc "Remove a user's check-in from a club."
  def checkout(club_id, session) do
    case Repo.get_by(ClubCheckin, user_id: session.id, club_id: club_id) do
      nil -> {:error, :not_found}
      checkin -> Repo.delete(checkin)
    end
  end

  @doc "Toggle the is_open flag on an existing check-in."
  def set_open(club_id, session, is_open) do
    case Repo.get_by(ClubCheckin, user_id: session.id, club_id: club_id) do
      nil -> {:error, :not_found}
      checkin ->
        checkin
        |> ClubCheckin.changeset(%{is_open: is_open})
        |> Repo.update()
    end
  end

  @doc "Get the current user's check-in for a club."
  def get_my_checkin(club_id, session) do
    now = DateTime.utc_now()

    case Repo.get_by(ClubCheckin, user_id: session.id, club_id: club_id) do
      nil -> {:ok, nil}
      %{expires_at: exp} = checkin when not is_nil(exp) and exp < now ->
        Repo.delete(checkin)
        {:ok, nil}
      checkin ->
        {:ok, checkin}
    end
  end

  @doc "List all users who are currently checked in and open at a club."
  def list_open_users(club_id, session) do
    now = DateTime.utc_now()

    ClubCheckin
    |> where([c], c.club_id == ^club_id)
    |> where([c], c.is_open == true)
    |> where([c], c.user_id != ^session.id)
    |> where([c], is_nil(c.expires_at) or c.expires_at > ^now)
    |> preload(:user)
    |> Repo.all()
  end

  @doc "Clean up expired check-ins and QR codes (run on server startup)."
  def cleanup_expired do
    now = DateTime.utc_now()

    ClubCheckin
    |> where([c], not is_nil(c.expires_at) and c.expires_at < ^now)
    |> Repo.delete_all()

    ClubQRCode
    |> where([q], q.expires_at < ^now)
    |> Repo.delete_all()
  end

  # ── QR Code Generation ────────────────────────────────────────────────────────

  @doc """
  Generate a new QR code token for a club gig.
  `valid_date` is the gig date (YYYY-MM-DD string or Date).
  `expires_at` is a UTC datetime string when the code becomes invalid.
  `label` is an optional human-readable name (e.g. "Friday Night").
  """
  def generate_qr_code(club_id, attrs) do
    token = :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)

    %ClubQRCode{}
    |> ClubQRCode.changeset(Map.merge(attrs, %{"token" => token, "club_id" => club_id}))
    |> Repo.insert()
  end

  @doc "Look up a QR code by token. Returns {:ok, qr}, {:error, :expired}, or {:error, :not_found}.
  Expired codes are deleted from the database before returning."
  def get_qr_by_token(token) do
    case Repo.get_by(ClubQRCode, token: token) do
      nil -> {:error, :not_found}
      qr ->
        if DateTime.compare(qr.expires_at, DateTime.utc_now()) == :lt do
          Repo.delete(qr)
          {:error, :expired}
        else
          {:ok, Repo.preload(qr, :club)}
        end
    end
  end

  @doc "List all QR codes for a club, most recent first."
  def list_club_qr_codes(club_id) do
    ClubQRCode
    |> where([q], q.club_id == ^club_id)
    |> order_by([q], desc: q.valid_date)
    |> Repo.all()
  end

  @doc "Returns true if the club has at least one non-expired QR code valid for today."
  def has_active_qr_code?(club_id) do
    today = Date.utc_today()
    now = DateTime.utc_now()

    ClubQRCode
    |> where([q], q.club_id == ^club_id)
    |> where([q], q.valid_date == ^today)
    |> where([q], q.expires_at > ^now)
    |> Repo.exists?()
  end

  @doc "Delete a QR code by ID."
  def delete_qr_code(id, club_id) do
    case Repo.get_by(ClubQRCode, id: id, club_id: club_id) do
      nil -> {:error, :not_found}
      qr -> Repo.delete(qr)
    end
  end
end
