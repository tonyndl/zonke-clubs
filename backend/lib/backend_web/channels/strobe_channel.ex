defmodule BackendWeb.StrobeChannel do
  use BackendWeb, :channel

  alias Backend.Strobe
  alias BackendWeb.Presence

  @impl true
  def join("strobe:" <> club_id, _payload, socket) do
    # Any authenticated user can join to listen
    send(self(), :after_join)
    {:ok, assign(socket, :club_id, club_id)}
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: System.system_time(:second)
      })

    # Send initial presence state to the newly joined client
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # ── DJ sends strobe start ─────────────────────────────────────────────────────

  @impl true
  def handle_in("start_strobe", params, socket) do
    club_id = socket.assigns.club_id
    session = %{id: socket.assigns.user_id}

    case Strobe.start_session(club_id, params, session) do
      {:ok, strobe_session} ->
        server_time = DateTime.utc_now() |> DateTime.to_unix(:millisecond)

        broadcast!(socket, "strobe_started", %{
          session_id: strobe_session.id,
          dj_user_id: strobe_session.dj_user_id,
          bpm: strobe_session.bpm,
          effect: strobe_session.effect,
          custom_on_ms: strobe_session.custom_on_ms,
          custom_off_ms: strobe_session.custom_off_ms,
          server_time: server_time
        })

        {:reply, {:ok, %{session_id: strobe_session.id, bpm: strobe_session.bpm, effect: strobe_session.effect, custom_on_ms: strobe_session.custom_on_ms, custom_off_ms: strobe_session.custom_off_ms, server_time: server_time}}, socket}

      {:error, :unauthorized} ->
        {:reply, {:error, %{reason: "not_approved"}}, socket}

      {:error, _} ->
        {:reply, {:error, %{reason: "failed"}}, socket}
    end
  end

  # ── DJ updates BPM or effect ──────────────────────────────────────────────────

  @impl true
  def handle_in("update_strobe", %{"session_id" => session_id} = params, socket) do
    session = %{id: socket.assigns.user_id}

    case Strobe.update_session(session_id, params, session) do
      {:ok, strobe_session} ->
        server_time = DateTime.utc_now() |> DateTime.to_unix(:millisecond)

        broadcast!(socket, "strobe_updated", %{
          session_id: strobe_session.id,
          dj_user_id: strobe_session.dj_user_id,
          bpm: strobe_session.bpm,
          effect: strobe_session.effect,
          custom_on_ms: strobe_session.custom_on_ms,
          custom_off_ms: strobe_session.custom_off_ms,
          server_time: server_time
        })

        {:reply, :ok, socket}

      {:error, :not_found} ->
        {:reply, {:error, %{reason: "not_found"}}, socket}

      {:error, _} ->
        {:reply, {:error, %{reason: "failed"}}, socket}
    end
  end

  # ── DJ stops strobe ────────────────────────────────────────────────────────────

  @impl true
  def handle_in("stop_strobe", %{"session_id" => session_id}, socket) do
    session = %{id: socket.assigns.user_id}

    case Strobe.stop_session(session_id, session) do
      {:ok, _} ->
        broadcast!(socket, "strobe_stopped", %{session_id: session_id})
        {:reply, :ok, socket}

      {:error, :not_found} ->
        {:reply, {:error, %{reason: "not_found"}}, socket}

      {:error, _} ->
        {:reply, {:error, %{reason: "failed"}}, socket}
    end
  end

  # ── DJ live override (hold to flash) ─────────────────────────────────────────

  @impl true
  def handle_in("override_on", _payload, socket) do
    broadcast!(socket, "strobe_override", %{on: true})
    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("override_off", payload, socket) do
    resume = Map.get(payload, "resume", true)
    broadcast!(socket, "strobe_override", %{on: false, resume: resume})
    {:reply, :ok, socket}
  end

  # ── Audience requests current session state ────────────────────────────────────

  @impl true
  def handle_in("get_current_session", _payload, socket) do
    club_id = socket.assigns.club_id

    case Strobe.get_active_session(club_id) do
      nil ->
        {:reply, {:ok, %{session: nil}}, socket}

      strobe_session ->
        server_time = DateTime.utc_now() |> DateTime.to_unix(:millisecond)

        {:reply,
         {:ok,
          %{
            session: %{
              session_id: strobe_session.id,
              dj_user_id: strobe_session.dj_user_id,
              bpm: strobe_session.bpm,
              effect: strobe_session.effect,
              custom_on_ms: strobe_session.custom_on_ms,
              custom_off_ms: strobe_session.custom_off_ms,
              server_time: server_time
            }
          }}, socket}
    end
  end
end
