defmodule Backend.ConnectionsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Connections
  alias Backend.Connections.ConnectionRequest

  describe "create_request/1" do
    test "creates connection request with valid attributes" do
      sender = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: sender, club: club)

      attrs = %{
        "sender_id" => sender.id,
        "receiver_id" => receiver.id,
        "club_id" => club.id,
        "intention_id" => intention.id,
        "message" => "Let's connect!",
        "status" => "pending"
      }

      assert {:ok, request} = Connections.create_request(attrs)
      assert request.sender_id == sender.id
      assert request.receiver_id == receiver.id
      assert request.status == "pending"
      assert request.message == "Let's connect!"
    end

    test "prevents duplicate requests in same direction" do
      sender = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: sender, club: club)

      # Create first request
      insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        intention_id: intention.id,
        status: "pending"
      )

      # Try to create duplicate
      attrs = %{
        "sender_id" => sender.id,
        "receiver_id" => receiver.id,
        "intention_id" => intention.id,
        "status" => "pending"
      }

      assert {:error, :duplicate_connection_request} = Connections.create_request(attrs)
    end

    test "prevents duplicate requests in opposite direction" do
      sender = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: sender, club: club)

      # User A sends request to User B
      insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        intention_id: intention.id,
        status: "pending"
      )

      # User B tries to send request to User A (bidirectional duplicate)
      attrs = %{
        "sender_id" => receiver.id,
        "receiver_id" => sender.id,
        "intention_id" => intention.id,
        "status" => "pending"
      }

      assert {:error, :duplicate_connection_request} = Connections.create_request(attrs)
    end

    test "allows new request if previous was declined" do
      sender = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: sender, club: club)

      # Create and decline request
      insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        intention_id: intention.id,
        status: "declined"
      )

      # Should allow new request
      attrs = %{
        "sender_id" => sender.id,
        "receiver_id" => receiver.id,
        "intention_id" => intention.id,
        "status" => "pending"
      }

      assert {:ok, request} = Connections.create_request(attrs)
      assert request.status == "pending"
    end
  end

  describe "get_request/1" do
    test "returns connection request with preloaded associations" do
      request = insert(:connection_request)

      assert {:ok, found} = Connections.get_request(request.id)
      assert found.id == request.id
      assert found.sender.id == request.sender_id
      assert found.receiver.id == request.receiver_id
    end

    test "returns error when request not found" do
      assert {:error, :not_found} = Connections.get_request(Ecto.UUID.generate())
    end
  end

  describe "list_received_requests/1" do
    test "returns pending requests received by user" do
      user = insert(:user)
      sender = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: sender, club: club, planned_date: Date.add(Date.utc_today(), 1))

      request = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: user.id,
        intention_id: intention.id,
        status: "pending"
      )

      requests = Connections.list_received_requests(user.id)

      assert length(requests) == 1
      assert hd(requests).id == request.id
    end

    test "returns accepted requests regardless of date" do
      user = insert(:user)
      sender = insert(:user)
      club = insert(:club)
      # Past intention
      intention = insert(:intention, user: sender, club: club, planned_date: Date.add(Date.utc_today(), -10))

      request = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: user.id,
        intention_id: intention.id,
        status: "accepted"
      )

      requests = Connections.list_received_requests(user.id)

      # Accepted requests should be included even with past dates
      assert length(requests) == 1
      assert hd(requests).id == request.id
    end

    test "excludes pending requests with past intention dates" do
      user = insert(:user)
      sender = insert(:user)
      club = insert(:club)
      # Past intention
      past_intention = insert(:intention, user: sender, club: club, planned_date: Date.add(Date.utc_today(), -10))

      _past_request = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: user.id,
        intention_id: past_intention.id,
        status: "pending"
      )

      requests = Connections.list_received_requests(user.id)

      # Should not include pending requests with past dates
      assert requests == []
    end

    test "excludes declined requests" do
      user = insert(:user)
      sender = insert(:user)

      _declined = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: user.id,
        status: "declined"
      )

      requests = Connections.list_received_requests(user.id)

      assert requests == []
    end

    test "orders by inserted_at desc (most recent first)" do
      user = insert(:user)
      sender1 = insert(:user)
      sender2 = insert(:user)

      request1 = insert(:connection_request,
        sender_id: sender1.id,
        receiver_id: user.id,
        status: "pending",
        inserted_at: ~N[2024-01-01 10:00:00]
      )

      request2 = insert(:connection_request,
        sender_id: sender2.id,
        receiver_id: user.id,
        status: "pending",
        inserted_at: ~N[2024-01-02 10:00:00]
      )

      requests = Connections.list_received_requests(user.id)

      # Most recent first
      assert Enum.map(requests, & &1.id) == [request2.id, request1.id]
    end
  end

  describe "list_sent_requests/1" do
    test "returns pending requests sent by user" do
      user = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      intention = insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), 1))

      request = insert(:connection_request,
        sender_id: user.id,
        receiver_id: receiver.id,
        intention_id: intention.id,
        status: "pending"
      )

      requests = Connections.list_sent_requests(user.id)

      assert length(requests) == 1
      assert hd(requests).id == request.id
    end

    test "returns accepted requests regardless of date" do
      user = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      past_intention = insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), -10))

      request = insert(:connection_request,
        sender_id: user.id,
        receiver_id: receiver.id,
        intention_id: past_intention.id,
        status: "accepted"
      )

      requests = Connections.list_sent_requests(user.id)

      # Accepted requests should be included even with past dates
      assert length(requests) == 1
      assert hd(requests).id == request.id
    end

    test "excludes pending requests with past intention dates" do
      user = insert(:user)
      receiver = insert(:user)
      club = insert(:club)
      past_intention = insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), -10))

      _past_request = insert(:connection_request,
        sender_id: user.id,
        receiver_id: receiver.id,
        intention_id: past_intention.id,
        status: "pending"
      )

      requests = Connections.list_sent_requests(user.id)

      assert requests == []
    end
  end

  describe "accept_request/1" do
    test "accepts request and creates thread" do
      request = insert(:connection_request, status: "pending")

      assert {:ok, accepted} = Connections.accept_request(request)
      assert accepted.status == "accepted"
      assert accepted.thread_id != nil
    end

    test "associates existing thread if one exists" do
      sender = insert(:user)
      receiver = insert(:user)
      thread = insert(:thread)

      # Add both users as participants
      insert(:thread_participant, thread: thread, user: sender)
      insert(:thread_participant, thread: thread, user: receiver)

      request = insert(:connection_request, sender_id: sender.id, receiver_id: receiver.id, status: "pending")

      assert {:ok, accepted} = Connections.accept_request(request)
      assert accepted.thread_id == thread.id
    end
  end

  describe "decline_request/1" do
    test "declines request" do
      request = insert(:connection_request, status: "pending")

      assert {:ok, declined} = Connections.decline_request(request)
      assert declined.status == "declined"
    end
  end

  describe "cancel_request/1" do
    test "deletes request" do
      request = insert(:connection_request, status: "pending")

      assert {:ok, deleted} = Connections.cancel_request(request)
      assert deleted.id == request.id
      assert {:error, :not_found} = Connections.get_request(request.id)
    end
  end

  describe "authorize_action/3" do
    test "sender can cancel request" do
      request = insert(:connection_request)

      assert :ok = Connections.authorize_action(request, request.sender_id, :cancel)
    end

    test "receiver cannot cancel request" do
      request = insert(:connection_request)

      assert {:error, :unauthorized} = Connections.authorize_action(request, request.receiver_id, :cancel)
    end

    test "receiver can accept request" do
      request = insert(:connection_request)

      assert :ok = Connections.authorize_action(request, request.receiver_id, :accept)
    end

    test "sender cannot accept request" do
      request = insert(:connection_request)

      assert {:error, :unauthorized} = Connections.authorize_action(request, request.sender_id, :accept)
    end

    test "receiver can decline request" do
      request = insert(:connection_request)

      assert :ok = Connections.authorize_action(request, request.receiver_id, :decline)
    end

    test "either user can disconnect" do
      request = insert(:connection_request, status: "accepted")

      assert :ok = Connections.authorize_action(request, request.sender_id, :disconnect)
      assert :ok = Connections.authorize_action(request, request.receiver_id, :disconnect)
    end

    test "returns error for invalid action" do
      request = insert(:connection_request)

      assert {:error, :invalid_action} = Connections.authorize_action(request, request.sender_id, :invalid)
    end
  end

  describe "disconnect/2" do
    test "sender can disconnect from accepted connection" do
      thread = insert(:thread)
      request = insert(:connection_request, status: "accepted", thread_id: thread.id)

      assert {:ok, disconnected} = Connections.disconnect(request, request.sender_id)
      assert disconnected.status == "declined"
    end

    test "receiver can disconnect from accepted connection" do
      thread = insert(:thread)
      request = insert(:connection_request, status: "accepted", thread_id: thread.id)

      assert {:ok, disconnected} = Connections.disconnect(request, request.receiver_id)
      assert disconnected.status == "declined"
    end

    test "unauthorized user cannot disconnect" do
      other_user = insert(:user)
      thread = insert(:thread)
      request = insert(:connection_request, status: "accepted", thread_id: thread.id)

      assert {:error, :unauthorized} = Connections.disconnect(request, other_user.id)
    end
  end

  describe "get_request_by_thread/1" do
    test "returns most recent non-declined request for thread" do
      thread = insert(:thread)
      request = insert(:connection_request, thread_id: thread.id, status: "accepted")

      assert {:ok, found} = Connections.get_request_by_thread(thread.id)
      assert found.id == request.id
    end

    test "excludes declined requests" do
      thread = insert(:thread)
      _declined = insert(:connection_request, thread_id: thread.id, status: "declined")

      assert {:error, :not_found} = Connections.get_request_by_thread(thread.id)
    end

    test "returns most recent when multiple requests in thread" do
      sender = insert(:user)
      receiver = insert(:user)

      thread = insert(:thread)
      insert(:thread_participant, thread: thread, user: sender)
      insert(:thread_participant, thread: thread, user: receiver)

      _older = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        thread_id: nil,
        status: "declined",
        inserted_at: ~N[2024-01-01 10:00:00]
      )

      # Accept a request which creates/assigns thread
      recent = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        thread_id: thread.id,
        status: "accepted",
        inserted_at: ~N[2024-01-02 10:00:00]
      )

      assert {:ok, found} = Connections.get_request_by_thread(thread.id)
      assert found.id == recent.id
    end
  end

  describe "get_any_request_by_thread/1" do
    test "returns request including declined ones" do
      thread = insert(:thread)
      declined = insert(:connection_request, thread_id: thread.id, status: "declined")

      assert {:ok, found} = Connections.get_any_request_by_thread(thread.id)
      assert found.id == declined.id
    end

    test "returns error when thread has no requests" do
      thread = insert(:thread)

      assert {:error, :not_found} = Connections.get_any_request_by_thread(thread.id)
    end
  end

  describe "reconnect/3" do
    test "swaps sender/receiver when original sender reconnects" do
      sender = insert(:user)
      receiver = insert(:user)
      thread = insert(:thread)

      declined_request = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        thread_id: thread.id,
        status: "declined"
      )

      # Original sender wants to reconnect
      assert {:ok, reconnected} = Connections.reconnect(declined_request, sender.id, "Let's reconnect!")

      # Roles should be swapped
      assert reconnected.sender_id == receiver.id
      assert reconnected.receiver_id == sender.id
      assert reconnected.status == "pending"
      assert reconnected.message == "Let's reconnect!"
    end

    test "keeps same roles when original receiver reconnects" do
      sender = insert(:user)
      receiver = insert(:user)
      thread = insert(:thread)

      declined_request = insert(:connection_request,
        sender_id: sender.id,
        receiver_id: receiver.id,
        thread_id: thread.id,
        status: "declined"
      )

      # Original receiver wants to reconnect
      assert {:ok, reconnected} = Connections.reconnect(declined_request, receiver.id, "Let's reconnect!")

      # Roles should stay the same
      assert reconnected.sender_id == sender.id
      assert reconnected.receiver_id == receiver.id
      assert reconnected.status == "pending"
    end
  end
end
