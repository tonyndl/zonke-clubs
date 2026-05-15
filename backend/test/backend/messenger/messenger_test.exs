defmodule Backend.Messenger.MessengerTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Messenger.Messenger
  alias Backend.Messenger.{Thread, Message}
  alias Backend.Repo

  describe "create_thread/2" do
    test "creates a thread with two participants" do
      user1 = insert(:user)
      user2 = insert(:user)

      assert {:ok, %Thread{} = thread} = Messenger.create_thread(user1.id, user2.id)

      participants = Repo.all(
        from tp in Backend.Messenger.ThreadParticipant,
          where: tp.thread_id == ^thread.id
      )
      participant_ids = Enum.map(participants, & &1.user_id)
      assert user1.id in participant_ids
      assert user2.id in participant_ids
    end
  end

  describe "find_thread_between_users/2" do
    test "returns nil when no thread exists" do
      user1 = insert(:user)
      user2 = insert(:user)
      assert Messenger.find_thread_between_users(user1.id, user2.id) == nil
    end

    test "returns the existing thread between two users" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      found = Messenger.find_thread_between_users(user1.id, user2.id)
      assert found.id == thread.id
    end

    test "returns thread regardless of argument order" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      found = Messenger.find_thread_between_users(user2.id, user1.id)
      assert found.id == thread.id
    end
  end

  describe "get_or_create_thread/2" do
    test "creates a thread when one does not exist" do
      user1 = insert(:user)
      user2 = insert(:user)

      assert {:ok, %Thread{}} = Messenger.get_or_create_thread(user1.id, user2.id)
    end

    test "returns existing thread without creating a new one" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:ok, found} = Messenger.get_or_create_thread(user1.id, user2.id)
      assert found.id == thread.id

      count = Repo.aggregate(Thread, :count)
      assert count == 1
    end
  end

  describe "get_thread/2" do
    test "returns thread with messages for participant" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:ok, found} = Messenger.get_thread(thread.id, user1)
      assert found.id == thread.id
      assert found.messages != nil
    end

    test "returns error when user is not a participant" do
      user1 = insert(:user)
      user2 = insert(:user)
      outsider = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:error, :not_found} = Messenger.get_thread(thread.id, outsider)
    end

    test "returns error for non-existent thread" do
      user = insert(:user)
      assert {:error, :not_found} = Messenger.get_thread(Ecto.UUID.generate(), user)
    end
  end

  describe "send_message/3" do
    test "sends a message in a thread" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:ok, %Message{} = message} = Messenger.send_message(thread.id, user1, "Hello!")
      assert message.content == "Hello!"
      assert message.sender_id == user1.id
      assert message.thread_id == thread.id
    end

    test "returns error when user is not a participant" do
      user1 = insert(:user)
      user2 = insert(:user)
      outsider = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:error, :forbidden} = Messenger.send_message(thread.id, outsider, "Hi!")
    end

    test "message status is sent or delivered" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      {:ok, message} = Messenger.send_message(thread.id, user1, "Testing status")
      assert message.status in ["sent", "delivered"]
    end
  end

  describe "mark_messages_as_read/2" do
    test "marks other user's messages as read" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)
      {:ok, _} = Messenger.send_message(thread.id, user1, "Unread message")

      Messenger.mark_messages_as_read(thread.id, user2)

      messages = Repo.all(from m in Message, where: m.thread_id == ^thread.id)
      assert Enum.all?(messages, & &1.is_read)
    end

    test "does not mark sender's own messages as read for them" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)
      {:ok, _} = Messenger.send_message(thread.id, user1, "My own message")

      Messenger.mark_messages_as_read(thread.id, user1)

      messages = Repo.all(from m in Message, where: m.thread_id == ^thread.id and m.sender_id == ^user1.id)
      assert Enum.all?(messages, &(&1.is_read == false))
    end
  end

  describe "mark_messages_as_delivered/2" do
    test "marks sent messages as delivered" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)
      {:ok, _} = Messenger.send_message(thread.id, user1, "Sent message")

      # Manually set message to "sent" status to ensure test isolation
      Repo.update_all(
        from(m in Message, where: m.thread_id == ^thread.id),
        set: [status: "sent"]
      )

      Messenger.mark_messages_as_delivered(thread.id, user2)

      messages = Repo.all(from m in Message, where: m.thread_id == ^thread.id)
      assert Enum.all?(messages, &(&1.status == "delivered"))
    end
  end

  describe "get_other_participant/2" do
    test "returns the other user in the thread" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      other = Messenger.get_other_participant(thread.id, user1)
      assert other.id == user2.id
    end

  end

  describe "clear_thread_messages/2" do
    test "deletes all messages in the thread for a participant" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)
      {:ok, _} = Messenger.send_message(thread.id, user1, "First")
      {:ok, _} = Messenger.send_message(thread.id, user2, "Second")

      assert {:ok, :cleared} = Messenger.clear_thread_messages(thread.id, user1)

      remaining = Repo.all(from m in Message, where: m.thread_id == ^thread.id)
      assert remaining == []
    end

    test "returns unauthorized for non-participant" do
      user1 = insert(:user)
      user2 = insert(:user)
      outsider = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:error, :unauthorized} = Messenger.clear_thread_messages(thread.id, outsider)
    end
  end

  describe "list_user_threads/1" do
    test "returns threads for a user" do
      user = insert(:user)
      other1 = insert(:user)
      other2 = insert(:user)
      Messenger.create_thread(user.id, other1.id)
      Messenger.create_thread(user.id, other2.id)

      threads = Messenger.list_user_threads(user)
      assert length(threads) == 2
    end

    test "does not return threads the user is not part of" do
      user = insert(:user)
      other1 = insert(:user)
      other2 = insert(:user)
      Messenger.create_thread(other1.id, other2.id)

      threads = Messenger.list_user_threads(user)
      assert threads == []
    end
  end

  describe "check_connection_status/1" do
    test "returns ok with nil when no connection request for thread" do
      user1 = insert(:user)
      user2 = insert(:user)
      {:ok, thread} = Messenger.create_thread(user1.id, user2.id)

      assert {:ok, nil} = Messenger.check_connection_status(thread.id)
    end
  end
end
