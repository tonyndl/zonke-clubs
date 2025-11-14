defmodule BackendWeb.MessengerChannel do
  use Phoenix.Channel

  alias BackendWeb.Messenger.{MessageJSON, ThreadJSON}
  alias Backend.Messenger.{Threads, Messages}
  alias Backend.ConnectionTracker
  alias Backend.AtomKeysHelper

  require Logger

  def join("chats:" <> thread_id, _params, socket) do
    user_id = socket.assigns.user_id
    ConnectionTracker.track_connection(user_id, "chats:#{thread_id}")
    Logger.info("Joining chats:#{thread_id} with user_id=#{inspect(socket.assigns[:user_id])}")

    {:ok, socket}
  end

  # def handle_info({:after_join, thread_id}, socket) do
  #   case Threads.get_thread(thread_id) do
  #     {:ok, thread} ->
  #       payload = ThreadJSON.show(%{thread: thread})
  #       push(socket, "chats:loaded", payload)

  #     {:error, reason} ->
  #       Logger.error("Failed to load thread: #{inspect(reason)}")
  #   end

  #   {:noreply, socket}
  # end

  # Removing connection when user leaves
  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    topic = socket.topic
    ConnectionTracker.remove_connection(user_id, topic)

    :ok
  end

  def handle_in("broadcast_to_my_chats", %{"event" => event} = params, socket) do
    user_id = socket.assigns.user_id

    payload =
      Map.get(params, "payload", %{})
      |> Map.put(:participant_id, user_id)

    ConnectionTracker.broadcast_to_all_user_connections(
      user_id,
      event,
      payload
    )

    Logger.info("Broadcasted #{event} to all user connections")
    {:noreply, socket}
  end

  def handle_in("msg_seen_status_changed", %{"thread_id" => thread_id}, socket) do
    broadcast_module = Application.get_env(:backend, :broadcast_module)

    broadcast_module.broadcast(
      "chats:" <> thread_id,
      "message_seen",
      %{"thread_id" => thread_id}
    )

    Logger.info("Messages seen in thread_id: #{inspect(thread_id)}")
    {:noreply, socket}
  end

  def handle_in("send_message", %{"params" => params}, socket) do
    user_id = socket.assigns.user_id
    atomized_params = AtomKeysHelper.string_keys_to_atoms(params)

    {:ok, message} = Messages.create(atomized_params, user_id)
    payload = MessageJSON.show(%{message: message})

    broadcast_module = Application.get_env(:backend, :broadcast_module)

    broadcast_module.broadcast_from!(
      self(),
      "chats:" <> message.thread_id,
      "new_message",
      payload
    )

    Logger.info("Messages sent to thread_id: #{inspect(message.thread_id)}")
    {:reply, {:ok, %{message: payload}}, socket}
  end
end
