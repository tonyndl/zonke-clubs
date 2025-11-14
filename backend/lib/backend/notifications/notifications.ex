defmodule Backend.Notifications.Notifications do
  alias Ecto.Multi
  alias Backend.Repo
  alias Backend.Notifications.Notification
  alias Backend.Accounts.BusinessProfile
  alias BackendWeb.UserChannel

  import Ecto.Query

  def get_notification(id) do
    Repo.get_by(Notification, id: id)
    |> format_notification
  end

  def get_user_notifications(user_id) do
    from(n in Notification,
      where: n.recipient_id == ^user_id
    )
    |> Repo.all()
  end

  def create(booking, notifier_id, %{booking: action}) do
    params = %{
      type: :booking,
      metadata: %{action: action},
      read: false,
      recipient_id: booking.user_id,
      notifier_id: notifier_id
    }

    Multi.new()
    |> Multi.insert(:notification, Notification.changeset(%Notification{}, params))
    |> Multi.run(:push_out, fn _repo, %{notification: notification} ->
      booking_action = "booking:#{Atom.to_string(action)}"
      UserChannel.push_out!(booking_action, notification)
      {:ok, notification}
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      result -> result
    end
  end

  def create(review, notifier_id, :review) do
    params = %{
      type: :review,
      read: false,
      recipient_id: review.user_id,
      notifier_id: notifier_id
    }

    Multi.new()
    |> Multi.insert(:notification, Notification.changeset(%Notification{}, params))
    |> Multi.run(:push_out, fn _repo, %{notification: notification} ->
      UserChannel.push_out!("review:created", notification)
      {:ok, notification}
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      result -> result
    end
  end

  def create(tag, %{tag: action}) do
    {recipient_id, notifier_id} =
      case action do
        :created -> {tag.tagged_id, tag.tagger_id}
        :approved -> {tag.tagger_id, tag.tagged_id}
        :rejected -> {tag.tagger_id, tag.tagged_id}
      end

    params = %{
      type: :tag,
      metadata: %{action: action},
      read: false,
      recipient_id: recipient_id,
      notifier_id: notifier_id
    }

    Multi.new()
    |> Multi.insert(:notification, Notification.changeset(%Notification{}, params))
    |> Multi.run(:push_out, fn _repo, %{notification: notification} ->
      tag_action = "tag:#{Atom.to_string(action)}"
      UserChannel.push_out!(tag_action, notification)
      {:ok, notification}
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      result -> result
    end
  end

  def mark_notification_as_read(notification) do
    notification
    |> Notification.changeset(%{read: true})
    |> Repo.update()
  end

  def delete(%Notification{} = notification) do
    case notification.read do
      true -> Repo.delete(notification)
      false -> {:ok, :notification_unread}
    end
  end

  defp format_notification(%Notification{} = notification), do: {:ok, notification}
  defp format_notification(nil), do: {:error, :not_found}
end
