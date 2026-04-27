defmodule Backend.Strobe do
  import Ecto.Query

  alias Backend.Repo
  alias Backend.Strobe.DJApproval
  alias Backend.Strobe.StrobeSession
  alias Backend.Accounts.Users
  alias Backend.Clubs.Club
  alias Backend.Workers.PushNotificationWorker

  # ── DJ-initiated approval requests ───────────────────────────────────────────

  @doc "DJ requests approval from a club (creates pending record)"
  def request_approval(club_id, session) do
    # Remove any existing request first
    delete_approval(club_id, session.id)

    result =
      %DJApproval{}
      |> DJApproval.changeset(%{
        dj_user_id: session.id,
        club_id: club_id,
        status: "pending"
      })
      |> Repo.insert()

    case result do
      {:ok, approval} ->
        # Preload DJ user info and broadcast to the club's strobe channel
        approval = Repo.preload(approval, :dj_user)
        BackendWeb.Endpoint.broadcast("strobe:#{club_id}", "new_dj_request", %{
          approval: %{
            id: approval.id,
            dj_user_id: approval.dj_user_id,
            club_id: approval.club_id,
            status: approval.status,
            expires_at: approval.expires_at,
            dj_user: %{
              id: approval.dj_user.id,
              username: approval.dj_user.username,
              avatar_url: approval.dj_user.avatar_url
            }
          }
        })
        {:ok, approval}

      error ->
        error
    end
  end

  @doc "Cancel any approval (pending or approved) - DJ-initiated"
  def cancel_request(club_id, session) do
    DJApproval
    |> where([a], a.club_id == ^club_id and a.dj_user_id == ^session.id)
    |> Repo.delete_all()

    BackendWeb.Endpoint.broadcast("strobe:#{club_id}", "dj_request_cancelled", %{
      dj_user_id: session.id
    })

    {:ok, :cancelled}
  end

  @doc "List all approvals for a DJ (both pending and approved)"
  def list_dj_approvals(session) do
    now = DateTime.utc_now()

    DJApproval
    |> where([a], a.dj_user_id == ^session.id)
    |> where(
      [a],
      a.status == "pending" or
        (a.status == "approved" and a.expires_at > ^now)
    )
    |> preload(:club)
    |> Repo.all()
  end

  # ── Club admin approval management ───────────────────────────────────────────

  @doc "Admin approves a DJ's pending request"
  def approve_dj(club_id, dj_user_id, _session) do
    expires_at =
      DateTime.utc_now()
      |> DateTime.add(24 * 3600, :second)
      |> DateTime.truncate(:second)

    result =
      case Repo.get_by(DJApproval, club_id: club_id, dj_user_id: dj_user_id) do
        nil ->
          %DJApproval{}
          |> DJApproval.changeset(%{
            dj_user_id: dj_user_id,
            club_id: club_id,
            status: "approved",
            expires_at: expires_at
          })
          |> Repo.insert()

        existing ->
          existing
          |> DJApproval.changeset(%{
            status: "approved",
            expires_at: expires_at
          })
          |> Repo.update()
      end

    case result do
      {:ok, approval} ->
        approval = Repo.preload(approval, :dj_user)
        BackendWeb.Endpoint.broadcast("user:#{dj_user_id}", "dj_request_approved", %{
          club_id: club_id
        })
        BackendWeb.Endpoint.broadcast("strobe:#{club_id}", "dj_approval_approved", %{
          approval: %{
            id: approval.id,
            dj_user_id: approval.dj_user_id,
            club_id: approval.club_id,
            status: approval.status,
            expires_at: approval.expires_at,
            dj_user: %{
              id: approval.dj_user.id,
              username: approval.dj_user.username,
              avatar_url: approval.dj_user.avatar_url
            }
          }
        })
        {:ok, approval}

      error ->
        error
    end
  end

  @doc "Revoke/deny a DJ's approval"
  def revoke_approval(club_id, dj_user_id, _session) do
    case Repo.get_by(DJApproval, club_id: club_id, dj_user_id: dj_user_id) do
      nil ->
        {:error, :not_found}

      approval ->
        case Repo.delete(approval) do
          {:ok, _} ->
            BackendWeb.Endpoint.broadcast("user:#{dj_user_id}", "dj_request_denied", %{
              club_id: club_id
            })
            BackendWeb.Endpoint.broadcast("strobe:#{club_id}", "dj_approval_revoked", %{
              dj_user_id: dj_user_id
            })
            {:ok, :deleted}

          error ->
            error
        end
    end
  end

  @doc "Check if a DJ has an active approved (non-expired) approval for a club"
  def get_active_approval(club_id, dj_user_id) do
    now = DateTime.utc_now()

    DJApproval
    |> where([a], a.club_id == ^club_id and a.dj_user_id == ^dj_user_id)
    |> where([a], a.status == "approved" and a.expires_at > ^now)
    |> Repo.one()
  end

  @doc "List all approvals (pending + active) for a club (admin view)"
  def list_club_approvals(club_id, _session) do
    now = DateTime.utc_now()

    DJApproval
    |> where([a], a.club_id == ^club_id)
    |> where([a], a.status == "pending" or (a.status == "approved" and a.expires_at > ^now))
    |> preload(:dj_user)
    |> Repo.all()
  end

  defp delete_approval(club_id, dj_user_id) do
    DJApproval
    |> where([a], a.club_id == ^club_id and a.dj_user_id == ^dj_user_id)
    |> Repo.delete_all()
  end

  # ── Strobe Sessions ───────────────────────────────────────────────────────────

  @doc "Start a new strobe session (DJ must have active approval)"
  def start_session(club_id, params, session) do
    case get_active_approval(club_id, session.id) do
      nil ->
        {:error, :unauthorized}

      _approval ->
        stop_existing_sessions(club_id, session.id)

        result =
          %StrobeSession{}
          |> StrobeSession.changeset(%{
            dj_user_id: session.id,
            club_id: club_id,
            bpm: params["bpm"] || 120,
            effect: params["effect"] || "beat",
            custom_on_ms: params["custom_on_ms"],
            custom_off_ms: params["custom_off_ms"],
            status: "active",
            started_at: DateTime.utc_now() |> DateTime.truncate(:second)
          })
          |> Repo.insert()

        case result do
          {:ok, strobe_session} ->
            Task.start(fn -> notify_nearby_users(club_id, strobe_session) end)
            {:ok, strobe_session}

          error ->
            error
        end
    end
  end

  @doc "Update a running strobe session"
  def update_session(session_id, params, session) do
    case get_dj_session(session_id, session.id) do
      nil ->
        {:error, :not_found}

      strobe_session ->
        strobe_session
        |> StrobeSession.changeset(Map.take(params, ["bpm", "effect", "custom_on_ms", "custom_off_ms"]))
        |> Repo.update()
    end
  end

  @doc "Stop a strobe session"
  def stop_session(session_id, session) do
    case get_dj_session(session_id, session.id) do
      nil ->
        {:error, :not_found}

      strobe_session ->
        strobe_session
        |> StrobeSession.changeset(%{status: "stopped"})
        |> Repo.update()
    end
  end

  @doc "List all active strobe sessions across all clubs"
  def list_active_sessions do
    expiry = DateTime.utc_now() |> DateTime.add(-6 * 3600, :second)

    StrobeSession
    |> where([s], s.status == "active" and s.started_at >= ^expiry)
    |> preload(:club)
    |> Repo.all()
  end

  @doc "Get the current active session for a club"
  def get_active_session(club_id) do
    expiry = DateTime.utc_now() |> DateTime.add(-6 * 3600, :second)

    StrobeSession
    |> where([s], s.club_id == ^club_id and s.status == "active" and s.started_at >= ^expiry)
    |> order_by([s], desc: s.started_at)
    |> limit(1)
    |> Repo.one()
  end

  @doc "Get DJ's active sessions"
  def list_dj_sessions(session) do
    expiry = DateTime.utc_now() |> DateTime.add(-6 * 3600, :second)

    StrobeSession
    |> where([s], s.dj_user_id == ^session.id and s.status == "active" and s.started_at >= ^expiry)
    |> order_by([s], desc: s.started_at)
    |> Repo.all()
  end

  defp get_dj_session(session_id, dj_user_id) do
    StrobeSession
    |> where([s], s.id == ^session_id and s.dj_user_id == ^dj_user_id and s.status == "active")
    |> Repo.one()
  end

  defp stop_existing_sessions(club_id, dj_user_id) do
    StrobeSession
    |> where([s], s.club_id == ^club_id and s.dj_user_id == ^dj_user_id and s.status == "active")
    |> Repo.update_all(set: [status: "stopped"])
  end

  defp notify_nearby_users(club_id, strobe_session) do
    club = Repo.get(Club, club_id)
    if club == nil, do: :ok

    club_lat = get_in(club.location, ["latitude"])
    club_lng = get_in(club.location, ["longitude"])

    if club_lat && club_lng do
      nearby_users = Users.list_users_near(club_lat, club_lng, 500, 7200, strobe_session.dj_user_id)

      Enum.each(nearby_users, fn user ->
        PushNotificationWorker.enqueue(
          user.id,
          "⚡ Strobe Sync at #{club.name}!",
          "The DJ just started a light show. Join the sync!",
          %{
            type: "strobe_invite",
            club_id: club_id,
            club_name: club.name,
            session_id: strobe_session.id
          },
          "strobe_invite"
        )
      end)
    end
  end
end
