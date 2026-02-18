defmodule BackendWeb.UserChannel do
  use BackendWeb, :channel
  alias BackendWeb.Presence
  alias Backend.Accounts.Users

  @impl true
  def join("user:" <> user_id, _payload, socket) do
    # Only allow users to join their own channel
    # Convert both to strings for comparison since user_id from URL is a string
    if to_string(socket.assigns.user_id) == user_id do
      # Track user presence
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id

    # Track presence in the user's channel
    {:ok, _} =
      Presence.track(socket, user_id, %{
        online_at: System.system_time(:second),
        user_id: user_id
      })

    # Update last_seen_at when user comes online
    Users.update_last_seen(user_id)

    # Mark all undelivered messages as delivered when user comes online
    mark_user_messages_as_delivered(user_id)

    # Push initial presence state to this user
    push(socket, "presence_state", Presence.list(socket))

    # Broadcast to presence:lobby topic that this user is online
    BackendWeb.Endpoint.broadcast("presence:lobby", "presence_diff", %{
      joins: %{user_id => %{user_id: user_id, online_at: System.system_time(:second)}},
      leaves: %{}
    })

    {:noreply, socket}
  end

  # Mark all messages sent to this user as delivered when they come online
  defp mark_user_messages_as_delivered(user_id) do
    alias Backend.Messenger.Message
    alias Backend.Messenger.ThreadParticipant
    alias Backend.Repo
    import Ecto.Query

    # Find all threads this user is part of
    thread_ids =
      from(tp in ThreadParticipant,
        where: tp.user_id == type(^user_id, :binary_id),
        select: tp.thread_id
      )
      |> Repo.all()

    # Update all messages in those threads that are sent to this user and still in "sent" status
    Enum.each(thread_ids, fn thread_id ->
      # Get messages that need to be marked as delivered
      messages_to_update =
        from(m in Message,
          where:
            m.thread_id == ^thread_id and
              m.sender_id != type(^user_id, :binary_id) and
              m.status == "sent",
          select: {m.id, m.sender_id}
        )
        |> Repo.all()

      # Update the messages
      if length(messages_to_update) > 0 do
        from(m in Message,
          where:
            m.thread_id == ^thread_id and
              m.sender_id != type(^user_id, :binary_id) and
              m.status == "sent"
        )
        |> Repo.update_all(set: [status: "delivered"])

        # Broadcast status update to the thread
        BackendWeb.Endpoint.broadcast(
          "thread:#{thread_id}",
          "message_status_updated",
          %{
            thread_id: thread_id,
            reader_id: user_id,
            status: "delivered",
            timestamp: DateTime.utc_now()
          }
        )
      end
    end)
  end

  @impl true
  def handle_in("ping", _payload, socket) do
    {:reply, {:ok, %{message: "pong"}}, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    # Update last_seen_at when user disconnects
    user_id = socket.assigns.user_id
    updated_user = Users.update_last_seen(user_id)

    # Broadcast to presence:lobby topic that this user went offline
    # Include the updated last_seen_at timestamp
    last_seen_at =
      case updated_user do
        {:ok, user} -> user.last_seen_at
        _ -> DateTime.utc_now()
      end

    BackendWeb.Endpoint.broadcast("presence:lobby", "presence_diff", %{
      joins: %{},
      leaves: %{user_id => %{user_id: user_id, last_seen_at: last_seen_at}}
    })

    :ok
  end
end
