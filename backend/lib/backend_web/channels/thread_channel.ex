defmodule BackendWeb.ThreadChannel do
  use BackendWeb, :channel
  alias Backend.Messenger.Messenger

  @impl true
  def join("thread:" <> thread_id, _payload, socket) do
    # Verify user has access to this thread
    session = %{id: socket.assigns.user_id}

    case Messenger.get_thread(thread_id, session) do
      {:ok, _thread} ->
        # Schedule after_join callback to mark messages as delivered
        send(self(), :after_join)
        {:ok, socket}

      {:error, :not_found} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    # Messages should already be marked as delivered when user is online (UserChannel handles this)
    # ThreadChannel is just for viewing the chat - read status is handled by explicit mark_read calls
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_message", %{"content" => content}, socket) do
    thread_id = socket.topic |> String.replace("thread:", "")
    session = %{id: socket.assigns.user_id}

    case Messenger.send_message(thread_id, session, content) do
      {:ok, message} ->
        broadcast!(socket, "new_message", %{message: message})
        {:reply, {:ok, %{message: message}}, socket}

      {:error, changeset} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end

  @impl true
  def handle_in("mark_read", _payload, socket) do
    thread_id = socket.topic |> String.replace("thread:", "")
    session = %{id: socket.assigns.user_id}

    Messenger.mark_messages_as_read(thread_id, session)

    # Broadcast read confirmation to other participants
    broadcast_status_update(socket, thread_id, session.id, "read")

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("mark_delivered", _payload, socket) do
    thread_id = socket.topic |> String.replace("thread:", "")
    session = %{id: socket.assigns.user_id}

    Messenger.mark_messages_as_delivered(thread_id, session)

    # Broadcast delivery confirmation to other participants
    broadcast_status_update(socket, thread_id, session.id, "delivered")

    {:reply, :ok, socket}
  end

  # Helper function to broadcast status updates
  defp broadcast_status_update(socket, thread_id, reader_id, status) do
    broadcast!(socket, "message_status_updated", %{
      thread_id: thread_id,
      reader_id: reader_id,
      status: status,
      timestamp: DateTime.utc_now()
    })
  end
end
