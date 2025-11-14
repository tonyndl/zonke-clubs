defmodule Backend.Messenger.ThreadTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Repo
  alias Backend.Messenger.Threads
  alias Backend.Messenger.Schemas.{Participant, Thread}
  alias Backend.Utils.BroadcastMock

  import Backend.Factory

  setup do
    u1 = insert(:user)
    u2 = insert(:user)
    u3 = insert(:user)

    p1 = Repo.get!(Participant, u1.id)
    p2 = Repo.get!(Participant, u2.id)
    p3 = Repo.get!(Participant, u3.id)

    session = %{user_id: p1.id}

    %{p1: p1, p2: p2, p3: p3, session: session}
  end

  describe "create/2" do
    test "successfully creates a thread", %{p1: p1, p2: p2} do
      {:ok, thread} = Threads.initialize_thread(p1.id, p2.id)

      assert Enum.any?(thread.thread_participants, fn tp -> tp.participant_id == p1.id end)
      assert Enum.any?(thread.thread_participants, fn tp -> tp.participant_id == p2.id end)
      assert length(thread.thread_participants) == 2
    end
  end

  test "fetches participant thread_ids", %{p1: p1, p2: p2, p3: p3} do
    {:ok, _thread} = Threads.initialize_thread(p1.id, p2.id)
    {:ok, _thread} = Threads.initialize_thread(p1.id, p3.id)

    assert [_, _] = Threads.get_participant_thread_ids(p1.id)
  end

  test "fetches participant threads with last message merged", %{p1: p1, p2: p2, p3: p3} do
    {:ok, thread_1} = Threads.initialize_thread(p1.id, p2.id)
    {:ok, thread_2} = Threads.initialize_thread(p1.id, p3.id)

    insert(:message,
      content: "First Message in Thread 1",
      inserted_at: Timex.shift(NaiveDateTime.utc_now(), minutes: -20),
      thread: thread_1,
      author: p1,
      recipient: p2
    )

    insert(:message,
      content: "Second Message in Thread 1",
      inserted_at: Timex.shift(NaiveDateTime.utc_now(), minutes: -15),
      thread: thread_1,
      author: p2,
      recipient: p1
    )

    insert(:message,
      content: "First Message in Thread 2",
      inserted_at: Timex.shift(NaiveDateTime.utc_now(), minutes: -10),
      thread: thread_2,
      author: p1,
      recipient: p3
    )

    insert(:message,
      content: "Second Message in Thread 2",
      inserted_at: Timex.shift(NaiveDateTime.utc_now(), minutes: -5),
      thread: thread_2,
      author: p3,
      recipient: p1,
      seen: true
    )

    assert [
             %Thread{
               thread_participants: thread_participants,
               id: thread_2_id,
               last_message: th_message_2,
               unseen_msg_count: unseen_msg_count_2
             },
             %Thread{last_message: th_message_1, unseen_msg_count: unseen_msg_count_1}
           ] = Threads.get_participant_threads(%{user_id: p1.id})

    assert thread_2_id == thread_2.id
    assert th_message_1.content == "Second Message in Thread 1"
    assert unseen_msg_count_1 == 1
    assert th_message_2.content == "Second Message in Thread 2"
    assert unseen_msg_count_2 == 0
  end

  test "marks messages as seen", %{p1: p1, p2: p2} do
    {:ok, thread} = Threads.initialize_thread(p1.id, p2.id)

    insert(:message, thread: thread, author: p1, recipient: p2)
    insert(:message, thread: thread, author: p1, recipient: p2)

    assert {2, nil} = Threads.mark_messages_as_seen(thread.id)
  end

  describe "delete/1" do
    test "deletes thread", %{p1: p1, p2: p2} do
      {:ok, thread} = Threads.initialize_thread(p1.id, p2.id)

      assert {:ok, _} = Threads.delete(thread)
      assert {:error, :not_found} = Threads.get_thread(thread.id)
    end
  end
end
