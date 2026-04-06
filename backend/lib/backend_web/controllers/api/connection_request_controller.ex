defmodule BackendWeb.API.ConnectionRequestController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Connections

  @doc """
  Get received connection requests for current user.
  Requires authentication.
  """
  def received(conn, _params, session) do
    requests = Connections.list_received_requests(session.id)

    conn
    |> put_status(:ok)
    |> render(:index, requests: requests)
  end

  @doc """
  Get sent connection requests for current user.
  Requires authentication.
  """
  def sent(conn, _params, session) do
    requests = Connections.list_sent_requests(session.id)

    conn
    |> put_status(:ok)
    |> render(:index, requests: requests)
  end

  @doc """
  Create a new connection request.
  Requires authentication.
  """
  def create(conn, params, session) do
    request_params = Map.put(params, "sender_id", session.id)

    with {:ok, request} <- Connections.create_request(request_params) do
      conn
      |> put_status(:created)
      |> render(:show, request: request)
    end
  end

  @doc """
  Accept a connection request.
  Requires authentication and user must be the receiver.
  """
  def accept(conn, %{"id" => id}, session) do
    with {:ok, request} <- Connections.get_request(id),
         :ok <- Connections.authorize_action(request, session.id, :accept),
         {:ok, updated_request} <- Connections.accept_request(request) do
      conn
      |> put_status(:ok)
      |> render(:show, request: updated_request)
    end
  end

  @doc """
  Decline a connection request.
  Requires authentication and user must be the receiver.
  """
  def decline(conn, %{"id" => id}, session) do
    with {:ok, request} <- Connections.get_request(id),
         :ok <- Connections.authorize_action(request, session.id, :decline),
         {:ok, updated_request} <- Connections.decline_request(request) do
      conn
      |> put_status(:ok)
      |> render(:show, request: updated_request)
    end
  end

  @doc """
  Batch delete connection requests.
  Deletes requests where the user is either sender or receiver.
  """
  def batch_delete(conn, %{"ids" => ids}, session) do
    with {:ok, count} <- Connections.delete_requests(ids, session.id) do
      conn
      |> put_status(:ok)
      |> render(:batch_delete, deleted: count)
    end
  end

  @doc """
  Cancel a connection request.
  Requires authentication and user must be the sender.
  """
  def cancel(conn, %{"id" => id}, session) do
    with {:ok, request} <- Connections.get_request(id),
         :ok <- Connections.authorize_action(request, session.id, :cancel),
         {:ok, _deleted} <- Connections.cancel_request(request) do
      conn
      |> put_status(:no_content)
      |> send_resp(204, "")
    end
  end

  @doc """
  Disconnect from a user using thread_id.
  Requires authentication and user must be either sender or receiver of the connection.
  """
  def disconnect_by_thread(conn, %{"thread_id" => thread_id}, session) do
    with {:ok, request} <- Connections.get_request_by_thread(thread_id),
         {:ok, updated_request} <- Connections.disconnect(request, session.id) do
      conn
      |> put_status(:ok)
      |> render(:show, request: updated_request)
    end
  end

  @doc """
  Get connection request by thread_id.
  Requires authentication and user must be either sender or receiver of the connection.
  """
  def get_by_thread(conn, %{"thread_id" => thread_id}, session) do
    with {:ok, request} <- Connections.get_request_by_thread(thread_id) do
      # Verify user is part of this connection
      if request.sender_id == session.id or request.receiver_id == session.id do
        conn
        |> put_status(:ok)
        |> render(:show, request: request)
      else
        {:error, :unauthorized}
      end
    end
  end

  @doc """
  Reconnect with a user by updating the existing declined connection request.
  Requires authentication. Finds the declined connection request and updates it to pending.
  """
  def reconnect_by_thread(conn, %{"thread_id" => thread_id} = params, session) do
    message = params["message"] || "Let's reconnect!"

    with {:ok, request} <- Connections.get_any_request_by_thread(thread_id),
         :ok <- verify_user_is_participant(request, session.id),
         {:ok, updated_request} <- Connections.reconnect(request, session.id, message) do
      conn
      |> put_status(:ok)
      |> render(:show, request: updated_request)
    end
  end

  defp verify_user_is_participant(request, user_id) do
    if request.sender_id == user_id or request.receiver_id == user_id do
      :ok
    else
      {:error, :unauthorized}
    end
  end
end
