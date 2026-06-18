defmodule BackendWeb.API.MessageController do
  use BackendWeb, :controller

  alias Backend.Messenger.Messenger

  action_fallback BackendWeb.FallbackController

  @doc """
  List all threads for the current user
  """
  def index(conn, _params, session) do
    threads = Messenger.list_user_threads(session)

    conn
    |> put_status(:ok)
    |> render(:index, threads: threads)
  end

  @doc """
  Get or create a thread with another user
  """
  def get_or_create(conn, %{"user_id" => other_user_id}, session) do
    with {:ok, thread} <- Messenger.get_or_create_thread(session.id, other_user_id),
         {:ok, thread_with_data} <- Messenger.get_thread(thread.id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, thread: thread_with_data)
    end
  end

  @doc """
  Get a specific thread with messages
  """
  def show(conn, %{"id" => thread_id}, session) do
    with {:ok, thread} <- Messenger.get_thread(thread_id, session) do
      # Mark messages as read
      Messenger.mark_messages_as_read(thread_id, session)

      conn
      |> put_status(:ok)
      |> render(:show, thread: thread)
    end
  end

  @doc """
  Send a message in a thread
  """
  def create(conn, %{"thread_id" => thread_id, "content" => content}, session) do
    with {:ok, message} <- Messenger.send_message(thread_id, session, content) do
      conn
      |> put_status(:created)
      |> render(:message, message: message)
    end
  end

  @doc """
  Clear all messages in a thread
  """
  def clear(conn, %{"id" => thread_id}, session) do
    with {:ok, :cleared} <- Messenger.clear_thread_messages(thread_id, session) do
      conn
      |> put_status(:ok)
      |> render(:cleared)
    end
  end
end
