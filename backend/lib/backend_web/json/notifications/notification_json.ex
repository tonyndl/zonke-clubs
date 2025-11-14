defmodule BackendWeb.Notifications.NotificationJSON do
  def index(%{notifications: notifications}) do
    for(notification <- notifications, do: show(%{notification: notification}))
  end

  def show(%{notification: notification}) do
    Map.take(notification, [
      :id,
      :type,
      :read,
      :metadata,
      :recipient_id,
      :notifier_id,
      :inserted_at,
      :updated_at
    ])
  end
end
