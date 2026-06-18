defmodule BackendWeb.API.StrobeJSON do
  def approval(%{approval: approval}) do
    %{approval: approval_data(approval)}
  end

  def approvals(%{approvals: approvals}) do
    %{approvals: Enum.map(approvals, &approval_data/1)}
  end

  def sessions(%{sessions: sessions}) do
    %{sessions: Enum.map(sessions, &session_data/1)}
  end

  def active_sessions(%{sessions: sessions}) do
    %{sessions: Enum.map(sessions, &active_session_data/1)}
  end

  defp active_session_data(s) do
    %{
      session_id: s.id,
      club_id: s.club_id,
      bpm: s.bpm,
      effect: s.effect,
      custom_on_ms: s.custom_on_ms,
      custom_off_ms: s.custom_off_ms,
      club_name: club_name(s)
    }
  end

  defp club_name(%{club: %{name: name}}), do: name
  defp club_name(_), do: nil

  def active_session(%{session: nil}), do: %{session: nil}

  def active_session(%{session: session}) do
    %{
      session: %{
        session_id: session.id,
        bpm: session.bpm,
        effect: session.effect,
        custom_on_ms: session.custom_on_ms,
        custom_off_ms: session.custom_off_ms,
        started_at: session.started_at
      }
    }
  end

  def ok(_), do: %{ok: true}

  defp approval_data(approval) do
    %{
      id: approval.id,
      dj_user_id: approval.dj_user_id,
      club_id: approval.club_id,
      status: approval.status,
      expires_at: approval.expires_at,
      club: club_summary(approval),
      dj_user: dj_user_summary(approval)
    }
  end

  defp club_summary(%{club: %{id: id, name: name}}),
    do: %{id: id, name: name}

  defp club_summary(_), do: nil

  defp dj_user_summary(%{dj_user: %{id: id, username: username, avatar_url: avatar_url}}),
    do: %{id: id, username: username, avatar_url: avatar_url}

  defp dj_user_summary(_), do: nil

  defp session_data(session) do
    %{
      id: session.id,
      club_id: session.club_id,
      bpm: session.bpm,
      effect: session.effect,
      status: session.status,
      started_at: session.started_at
    }
  end
end
