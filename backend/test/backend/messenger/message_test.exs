defmodule Backend.Messenger.MessageTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Messenger.Messages
  alias Backend.Messenger.Schemas.{Participant, Message}
  alias Backend.Utils.BroadcastMock

  import Backend.Factory

  setup do
    u1 = insert(:user)
    u2 = insert(:user)
    u3 = insert(:user)
    thread = insert(:thread)

    p1 = Repo.get!(Participant, u1.id)
    p2 = Repo.get!(Participant, u2.id)
    p3 = Repo.get!(Participant, u3.id)

    session = %{user_id: p1.id}

    %{p1: p1, p2: p2, p3: p3, thread: thread, session: session}
  end

  describe "create/2" do
    test "successfully creates message in thread", %{
      p1: p1,
      p2: p2,
      thread: thread,
      session: session
    } do
      params = %{
        content: "Hie there",
        recipient_id: p2.id,
        thread_id: thread.id
      }

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.content == "Hie there"
      end)

      {:ok, message} = Messages.create(params, session)

      assert message.content == "Hie there"
      assert message.author_id == p1.id
      assert message.recipient_id == p2.id
    end

    test "creates a thread and then inserts message into thread", %{
      p1: p1,
      p2: p2,
      session: session
    } do
      params = %{
        content: "Hie there",
        recipient_id: p2.id
      }

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.content == "Hie there"
      end)

      {:ok, message} = Messages.create(params, session)

      assert message.content == "Hie there"
      assert message.author_id == p1.id
      assert message.recipient_id == p2.id
    end
  end

  describe "update/2" do
    test "successfully updates message", %{
      p1: p1,
      p2: p2,
      thread: thread,
      session: session
    } do
      params = %{
        content: "Hie there",
        recipient_id: p2.id,
        thread_id: thread.id
      }

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.content == "Hie there"
      end)

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.content == "Hello buddy"
      end)

      {:ok, message} = Messages.create(params, session)
      {:ok, updated_message} = Messages.update(message, %{content: "Hello buddy"})

      assert updated_message.content == "Hello buddy"
    end
  end

  describe "delete/1" do
    test "deletes message", %{p1: p1, p2: p2, thread: thread, session: session} do
      params = %{
        content: "Hie there",
        recipient_id: p2.id,
        thread_id: thread.id
      }

      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.content == "Hie there"
      end)

      {:ok, message} = Messages.create(params, session)

      assert {:ok, _} = Messages.delete(message)
      assert {:error, :not_found} = Messages.get_message(message.id)
    end
  end

  # test ""
end
