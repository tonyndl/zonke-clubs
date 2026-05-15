defmodule Backend.StrobeTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Strobe
  alias Backend.Strobe.{DJApproval, StrobeSession}
  alias Backend.Repo

  # Helper: create a user session struct from a user
  defp session(user), do: user

  # Helper: create an active approval for a DJ at a club
  defp create_active_approval(club, dj_user) do
    expires_at =
      DateTime.utc_now()
      |> DateTime.add(24 * 3600, :second)
      |> DateTime.truncate(:second)

    Repo.insert!(%DJApproval{
      dj_user_id: dj_user.id,
      club_id: club.id,
      status: "approved",
      expires_at: expires_at
    })
  end

  # ── DJ Approval Requests ─────────────────────────────────────────────────────

  describe "request_approval/2" do
    test "creates a pending approval for a DJ" do
      club = insert(:club)
      dj = insert(:user)

      assert {:ok, approval} = Strobe.request_approval(club.id, session(dj))
      assert approval.status == "pending"
      assert approval.dj_user_id == dj.id
      assert approval.club_id == club.id
    end

    test "replaces existing request when DJ requests again" do
      club = insert(:club)
      dj = insert(:user)

      {:ok, _} = Strobe.request_approval(club.id, session(dj))
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      count = Repo.aggregate(from(a in DJApproval, where: a.club_id == ^club.id and a.dj_user_id == ^dj.id), :count)
      assert count == 1
    end
  end

  describe "cancel_request/2" do
    test "cancels a pending approval" do
      club = insert(:club)
      dj = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      assert {:ok, :cancelled} = Strobe.cancel_request(club.id, session(dj))
      assert Repo.get_by(DJApproval, club_id: club.id, dj_user_id: dj.id) == nil
    end

    test "returns cancelled even if no approval exists (idempotent)" do
      club = insert(:club)
      dj = insert(:user)
      assert {:ok, :cancelled} = Strobe.cancel_request(club.id, session(dj))
    end
  end

  describe "list_dj_approvals/1" do
    test "returns pending approvals for a DJ" do
      club = insert(:club)
      dj = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      approvals = Strobe.list_dj_approvals(session(dj))
      assert length(approvals) == 1
      assert hd(approvals).status == "pending"
    end

    test "returns non-expired approved approvals" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)

      approvals = Strobe.list_dj_approvals(session(dj))
      assert Enum.any?(approvals, &(&1.status == "approved"))
    end

    test "does not return expired approvals" do
      club = insert(:club)
      dj = insert(:user)

      expired_at = DateTime.utc_now() |> DateTime.add(-3600, :second) |> DateTime.truncate(:second)
      Repo.insert!(%DJApproval{
        dj_user_id: dj.id,
        club_id: club.id,
        status: "approved",
        expires_at: expired_at
      })

      approvals = Strobe.list_dj_approvals(session(dj))
      assert approvals == []
    end

    test "does not return other DJs' approvals" do
      club = insert(:club)
      dj1 = insert(:user)
      dj2 = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj1))

      approvals = Strobe.list_dj_approvals(session(dj2))
      assert approvals == []
    end
  end

  # ── Club Admin Approval Management ───────────────────────────────────────────

  describe "approve_dj/3" do
    test "approves a pending DJ request and sets expiry" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      assert {:ok, approval} = Strobe.approve_dj(club.id, dj.id, session(admin))
      assert approval.status == "approved"
      assert approval.expires_at != nil
    end

    test "creates an approval directly if no pending request exists" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)

      assert {:ok, approval} = Strobe.approve_dj(club.id, dj.id, session(admin))
      assert approval.status == "approved"
    end

    test "sets expiry approximately 24 hours from now" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      {:ok, approval} = Strobe.approve_dj(club.id, dj.id, session(admin))

      diff = DateTime.diff(approval.expires_at, DateTime.utc_now(), :second)
      assert diff > 23 * 3600
      assert diff <= 24 * 3600 + 5
    end
  end

  describe "revoke_approval/3" do
    test "revokes an existing approval" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)
      create_active_approval(club, dj)

      assert {:ok, :deleted} = Strobe.revoke_approval(club.id, dj.id, session(admin))
      assert Repo.get_by(DJApproval, club_id: club.id, dj_user_id: dj.id) == nil
    end

    test "returns error when no approval exists" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)

      assert {:error, :not_found} = Strobe.revoke_approval(club.id, dj.id, session(admin))
    end
  end

  describe "get_active_approval/2" do
    test "returns active non-expired approval" do
      club = insert(:club)
      dj = insert(:user)
      approval = create_active_approval(club, dj)

      found = Strobe.get_active_approval(club.id, dj.id)
      assert found.id == approval.id
    end

    test "returns nil when no approval exists" do
      club = insert(:club)
      dj = insert(:user)
      assert Strobe.get_active_approval(club.id, dj.id) == nil
    end

    test "returns nil for pending approval" do
      club = insert(:club)
      dj = insert(:user)
      {:ok, _} = Strobe.request_approval(club.id, session(dj))

      assert Strobe.get_active_approval(club.id, dj.id) == nil
    end

    test "returns nil for expired approval" do
      club = insert(:club)
      dj = insert(:user)

      expired_at = DateTime.utc_now() |> DateTime.add(-3600, :second) |> DateTime.truncate(:second)
      Repo.insert!(%DJApproval{
        dj_user_id: dj.id,
        club_id: club.id,
        status: "approved",
        expires_at: expired_at
      })

      assert Strobe.get_active_approval(club.id, dj.id) == nil
    end
  end

  describe "list_club_approvals/2" do
    test "returns pending and active approvals for a club" do
      club = insert(:club)
      dj1 = insert(:user)
      dj2 = insert(:user)
      admin = insert(:user)

      {:ok, _} = Strobe.request_approval(club.id, session(dj1))
      create_active_approval(club, dj2)

      approvals = Strobe.list_club_approvals(club.id, session(admin))
      assert length(approvals) == 2
    end

    test "does not return expired approvals" do
      club = insert(:club)
      dj = insert(:user)
      admin = insert(:user)

      expired_at = DateTime.utc_now() |> DateTime.add(-3600, :second) |> DateTime.truncate(:second)
      Repo.insert!(%DJApproval{
        dj_user_id: dj.id,
        club_id: club.id,
        status: "approved",
        expires_at: expired_at
      })

      approvals = Strobe.list_club_approvals(club.id, session(admin))
      assert approvals == []
    end

    test "does not return approvals from other clubs" do
      club1 = insert(:club)
      club2 = insert(:club)
      dj = insert(:user)
      admin = insert(:user)

      {:ok, _} = Strobe.request_approval(club1.id, session(dj))
      {:ok, _} = Strobe.request_approval(club2.id, session(dj))

      approvals = Strobe.list_club_approvals(club1.id, session(admin))
      assert length(approvals) == 1
    end
  end

  # ── Strobe Sessions ───────────────────────────────────────────────────────────

  describe "start_session/3" do
    test "starts a session for an approved DJ" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)

      params = %{"bpm" => 128, "effect" => "pulse"}
      assert {:ok, session_record} = Strobe.start_session(club.id, params, session(dj))
      assert session_record.status == "active"
      assert session_record.bpm == 128
      assert session_record.effect == "pulse"
    end

    test "returns unauthorized when DJ has no active approval" do
      club = insert(:club)
      dj = insert(:user)

      assert {:error, :unauthorized} = Strobe.start_session(club.id, %{}, session(dj))
    end

    test "stops existing session before starting a new one" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)

      {:ok, _first} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))
      {:ok, _second} = Strobe.start_session(club.id, %{"bpm" => 140, "effect" => "kick"}, session(dj))

      active = Repo.all(from s in StrobeSession, where: s.club_id == ^club.id and s.dj_user_id == ^dj.id and s.status == "active")
      assert length(active) == 1
    end

    test "uses default bpm and effect when not provided" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)

      {:ok, session_record} = Strobe.start_session(club.id, %{}, session(dj))
      assert session_record.bpm == 120
      assert session_record.effect == "beat"
    end
  end

  describe "update_session/3" do
    test "updates bpm and effect" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))

      assert {:ok, updated} = Strobe.update_session(strobe_session.id, %{"bpm" => "140", "effect" => "kick"}, session(dj))
      assert updated.bpm == 140
      assert updated.effect == "kick"
    end

    test "returns error when session not found" do
      dj = insert(:user)
      assert {:error, :not_found} = Strobe.update_session(Ecto.UUID.generate(), %{}, session(dj))
    end

    test "cannot update another DJ's session" do
      club = insert(:club)
      dj1 = insert(:user)
      dj2 = insert(:user)
      create_active_approval(club, dj1)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj1))

      assert {:error, :not_found} = Strobe.update_session(strobe_session.id, %{"bpm" => "150"}, session(dj2))
    end
  end

  describe "stop_session/2" do
    test "stops an active session" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))

      assert {:ok, stopped} = Strobe.stop_session(strobe_session.id, session(dj))
      assert stopped.status == "stopped"
    end

    test "returns error when session not found" do
      dj = insert(:user)
      assert {:error, :not_found} = Strobe.stop_session(Ecto.UUID.generate(), session(dj))
    end
  end

  describe "get_active_session/1" do
    test "returns the active session for a club" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))

      found = Strobe.get_active_session(club.id)
      assert found.id == strobe_session.id
    end

    test "returns nil when no active session exists" do
      club = insert(:club)
      assert Strobe.get_active_session(club.id) == nil
    end

    test "returns nil after session is stopped" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))
      Strobe.stop_session(strobe_session.id, session(dj))

      assert Strobe.get_active_session(club.id) == nil
    end
  end

  describe "list_active_sessions/0" do
    test "returns all active sessions" do
      club1 = insert(:club)
      club2 = insert(:club)
      dj1 = insert(:user)
      dj2 = insert(:user)
      create_active_approval(club1, dj1)
      create_active_approval(club2, dj2)

      {:ok, _} = Strobe.start_session(club1.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj1))
      {:ok, _} = Strobe.start_session(club2.id, %{"bpm" => 130, "effect" => "kick"}, session(dj2))

      sessions = Strobe.list_active_sessions()
      assert length(sessions) >= 2
    end

    test "does not return stopped sessions" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, strobe_session} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))
      Strobe.stop_session(strobe_session.id, session(dj))

      sessions = Strobe.list_active_sessions()
      refute Enum.any?(sessions, &(&1.id == strobe_session.id))
    end
  end

  describe "list_dj_sessions/1" do
    test "returns active sessions for a DJ" do
      club = insert(:club)
      dj = insert(:user)
      create_active_approval(club, dj)
      {:ok, _} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj))

      sessions = Strobe.list_dj_sessions(session(dj))
      assert length(sessions) == 1
    end

    test "does not return sessions from other DJs" do
      club = insert(:club)
      dj1 = insert(:user)
      dj2 = insert(:user)
      create_active_approval(club, dj1)
      {:ok, _} = Strobe.start_session(club.id, %{"bpm" => 120, "effect" => "pulse"}, session(dj1))

      sessions = Strobe.list_dj_sessions(session(dj2))
      assert sessions == []
    end
  end
end
