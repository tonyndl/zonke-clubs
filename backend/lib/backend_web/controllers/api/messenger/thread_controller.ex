defmodule BackendWeb.Messenger.ThreadController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Messenger.Threads
  alias Backend.Messenger.Schemas.Thread

  def create(conn, %{participant_id: participant_id}, %{user_id: user_id}) do
    with {:ok, %Thread{} = thread} <- Threads.initialize_thread(participant_id, user_id) do
      render(conn, :show, %{thread: thread})
    end
  end

  def show(conn, %{id: id}, _session) do
    thread = Threads.get_thread(id)

    with {:ok, %Thread{} = thread} do
      render(conn, :show, %{thread: thread})
    end
  end

  def delete(conn, %{id: id}, _session) do
    thread = Threads.get_thread(id, :plain)

    with {:ok, %Thread{}} <- Threads.delete(thread) do
      json(conn, :ok)
    end
  end

  def get_participant_threads(conn, params, session) do
    with {:ok, threads, paginate} <- Threads.get_participant_threads(params, session) do
      render(conn, :index, %{threads: threads, paginate: paginate})
    end
  end

  def set_seen_true(conn, %{thread_id: thread_id}, _session) do
    with {:ok, _count} <- Threads.mark_messages_as_seen(thread_id) do
      json(conn, %{status: "ok"})
    end
  end
end
