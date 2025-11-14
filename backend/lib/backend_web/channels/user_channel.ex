defmodule BackendWeb.UserChannel do
  use BackendWeb, :channel

  alias BackendWeb.Notifications.NotificationJSON
  alias Backend.Notifications.Notifications
  alias BackendWeb.Messenger.ThreadJSON
  alias Backend.Messenger.Threads
  alias Backend.AtomKeysHelper

  require Logger

  @actions [
    "booking:created",
    "booking:updated",
    "booking:deleted",
    "review:created",
    "tag:created",
    "tag:approved",
    "tag:rejected"
  ]

  def join("users:" <> user_id, _params, socket) do
    if user_id == socket.assigns.user_id do
      # send(self(), {:after_join, user_id})
      {:ok, socket}
    else
      {:error, %{reason: "Invalid user"}}
    end
  end

  # def handle_info({:after_join, user_id}, socket) do
  #   notifications = Notifications.get_user_notifications(user_id)
  #   notifications_json = NotificationJSON.index(%{notifications: notifications})
  #   payload = %{notifications: notifications_json}

  #   push(socket, "notifications:loaded", payload)

  #   {:noreply, socket}
  # end

  def push_out!(action, notification) when action in @actions do
    payload = NotificationJSON.show(%{notification: notification})

    broadcast_module = Application.get_env(:backend, :broadcast_module)

    broadcast_module.broadcast_from!(
      self(),
      "users:" <> notification.recipient_id,
      "notifications",
      payload
    )
  end

  def handle_in("send_message_to_new_thread", %{"params" => params}, socket) do
    user_id = socket.assigns.user_id
    atomized_params = AtomKeysHelper.string_keys_to_atoms(params)

    {:ok, thread} = Threads.put_message_in_new_thread(atomized_params, user_id)
    payload = ThreadJSON.show(%{thread: thread})

    broadcast_module = Application.get_env(:backend, :broadcast_module)

    broadcast_module.broadcast(
      "users:" <> atomized_params.recipient_id,
      "new_thread",
      payload
    )

    Logger.info("Message sent to NEW thread_id: #{inspect(thread.id)}")
    {:reply, {:ok, %{thread: payload}}, socket}
  end

  # check if current_token exists in that map
  # def handle_out("users:end_session", %{current_token: current_token}, socket) do
  #   with {:ok, jwt} <- UserSocket.from_assigns(socket, :jwt),
  #        ^jwt <- current_token do
  #     {:noreply, socket}
  #   else
  #     _ ->
  #       push(socket, "users:end_session", %{})
  #   end

  #   {:noreply, socket}
  # end
end
