defmodule Backend.Notifications.NotificationTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Notifications.{Notifications, Notification}
  alias Backend.Utils.BroadcastMock

  import Backend.Factory

  setup do
    user = insert(:user)
    booking = insert(:booking, user: user)
    tag = insert(:tag, tagger: user)
    review = insert(:review, user: user)

    %{user: user, booking: booking, tag: tag, review: review}
  end

  describe "create/2" do
    test "successfully creates a booking notification", %{user: user, booking: booking} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      assert {:ok, %{notification: notification}} =
               Notifications.create(booking, user.id, %{booking: :updated})

      assert notification.notifier_id == user.id
      assert notification.read == false
    end

    test "successfully creates a tag notification", %{user: user, tag: tag} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :tag
      end)

      assert {:ok, %{notification: notification}} = Notifications.create(tag, %{tag: :created})
      assert notification.notifier_id == user.id
      assert notification.read == false
    end

    test "successfully creates a review notification", %{user: user, review: review} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      assert {:ok, %{notification: notification}} = Notifications.create(review, user.id, :review)
      assert notification.notifier_id == user.id
      assert notification.read == false
    end
  end

  describe "delete/1" do
    test "successfully deletes a read notification", %{user: user, review: review} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      {:ok, %{notification: notification}} = Notifications.create(review, user.id, :review)
      {:ok, updated_notification} = Notifications.mark_notification_as_read(notification)

      assert {:ok, _} = Notifications.delete(updated_notification)
      assert {:error, :not_found} = Notifications.get_notification(updated_notification.id)
    end

    test "doesn't delete when notification unread", %{user: user, review: review} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :review
      end)

      {:ok, %{notification: notification}} = Notifications.create(review, user.id, :review)

      assert {:ok, :notification_unread} = Notifications.delete(notification)
    end
  end
end
