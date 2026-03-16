defmodule Backend.Connections do
  @moduledoc """
  Context for managing connection requests between users.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.Connections.ConnectionRequest
  alias Backend.Messenger.Messenger
  alias Backend.Workers.PushNotificationWorker

  @doc """
  Get all connection requests received by a user (where they are the receiver).
  Includes all accepted connections (regardless of intention date).
  For pending requests, only includes those with current/future intention dates.
  """
  def list_received_requests(user_id) do
    today = Date.utc_today()

    ConnectionRequest
    |> join(:left, [r], i in assoc(r, :intention))
    |> where([r], r.receiver_id == ^user_id)
    |> where([r], r.status in ["pending", "accepted"])
    |> where(
      [r, i],
      r.status == "accepted" or is_nil(r.intention_id) or i.planned_date >= ^today
    )
    |> order_by([r], desc: r.inserted_at)
    |> preload([:sender, :receiver, :club, :intention, :thread])
    |> Repo.all()
  end

  @doc """
  Get all connection requests sent by a user (where they are the sender).
  Includes all accepted connections (regardless of intention date).
  For pending requests, only includes those with current/future intention dates.
  """
  def list_sent_requests(user_id) do
    today = Date.utc_today()

    ConnectionRequest
    |> join(:left, [r], i in assoc(r, :intention))
    |> where([r], r.sender_id == ^user_id)
    |> where([r], r.status in ["pending", "accepted"])
    |> where(
      [r, i],
      r.status == "accepted" or is_nil(r.intention_id) or i.planned_date >= ^today
    )
    |> order_by([r], desc: r.inserted_at)
    |> preload([:sender, :receiver, :club, :intention, :thread])
    |> Repo.all()
  end

  @doc """
  Get a connection request by ID.
  """
  def get_request(id) do
    case Repo.get(ConnectionRequest, id) do
      nil -> {:error, :not_found}
      request -> {:ok, Repo.preload(request, [:sender, :receiver, :club, :intention])}
    end
  end

  @doc """
  Create a new connection request.
  Validates that there's no existing active connection in either direction.
  """
  def create_request(attrs) do
    sender_id = Map.get(attrs, "sender_id")
    receiver_id = Map.get(attrs, "receiver_id")
    intention_id = Map.get(attrs, "intention_id")

    # Check for existing active connection requests in EITHER direction
    # This prevents bidirectional duplicate requests
    base_query =
      ConnectionRequest
      |> where([r], r.status in ["pending", "accepted"])
      |> where(
        [r],
        (r.sender_id == ^sender_id and r.receiver_id == ^receiver_id) or
          (r.sender_id == ^receiver_id and r.receiver_id == ^sender_id)
      )

    # Add intention_id filter only if intention_id is provided
    query =
      if intention_id do
        where(base_query, [r], r.intention_id == ^intention_id)
      else
        base_query
      end

    existing_request = Repo.one(query)

    case existing_request do
      nil ->
        # No existing request, proceed with creation
        %ConnectionRequest{}
        |> ConnectionRequest.changeset(attrs)
        |> Repo.insert()
        |> case do
          {:ok, request} ->
            request = Repo.preload(request, [:sender, :receiver, :club, :intention])

            # Broadcast to receiver
            BackendWeb.Endpoint.broadcast(
              "user:#{request.receiver_id}",
              "new_connection_request",
              %{request: BackendWeb.API.ConnectionRequestJSON.show(%{request: request}).request}
            )

            # Notify receiver via push
            sender_name = request.sender.name || "Someone"
            PushNotificationWorker.enqueue(
              request.receiver_id,
              "New connection request",
              "#{sender_name} wants to connect with you",
              %{type: "connection_request", request_id: request.id}
            )

            {:ok, request}

          error ->
            error
        end

      _existing ->
        # Return error indicating duplicate connection request
        {:error, :duplicate_connection_request}
    end
  end

  @doc """
  Accept a connection request.
  Creates a chat thread between sender and receiver.
  """
  def accept_request(request) do
    # Create or get thread between sender and receiver
    with {:ok, thread} <- Messenger.get_or_create_thread(request.sender_id, request.receiver_id),
         {:ok, updated_request} <-
           request
           |> ConnectionRequest.changeset(%{status: "accepted", thread_id: thread.id})
           |> Repo.update() do
      updated_request =
        Repo.preload(updated_request, [:sender, :receiver, :club, :intention, :thread])

      # Broadcast to sender (person who sent the request)
      BackendWeb.Endpoint.broadcast(
        "user:#{updated_request.sender_id}",
        "connection_request_accepted",
        %{request: BackendWeb.API.ConnectionRequestJSON.show(%{request: updated_request}).request}
      )

      # Notify sender via push
      receiver_name = updated_request.receiver.name || "Someone"
      PushNotificationWorker.enqueue(
        updated_request.sender_id,
        "Connection accepted",
        "#{receiver_name} accepted your connection request",
        %{type: "connection_accepted", request_id: updated_request.id}
      )

      {:ok, updated_request}
    end
  end

  @doc """
  Decline a connection request.
  """
  def decline_request(request) do
    request
    |> ConnectionRequest.changeset(%{status: "declined"})
    |> Repo.update()
    |> case do
      {:ok, updated_request} ->
        updated_request = Repo.preload(updated_request, [:sender, :receiver, :club, :intention])

        # Broadcast to sender (person who sent the request)
        BackendWeb.Endpoint.broadcast(
          "user:#{updated_request.sender_id}",
          "connection_request_declined",
          %{
            request:
              BackendWeb.API.ConnectionRequestJSON.show(%{request: updated_request}).request
          }
        )

        {:ok, updated_request}

      error ->
        error
    end
  end

  @doc """
  Cancel a connection request (for sender).
  """
  def cancel_request(request) do
    Repo.delete(request)
  end

  @doc """
  Check if user is authorized to perform action on request.
  Sender can cancel, receiver can accept/decline.
  """
  def authorize_action(request, user_id, action) do
    case action do
      :cancel ->
        if request.sender_id == user_id, do: :ok, else: {:error, :unauthorized}

      :accept ->
        if request.receiver_id == user_id, do: :ok, else: {:error, :unauthorized}

      :decline ->
        if request.receiver_id == user_id, do: :ok, else: {:error, :unauthorized}

      :disconnect ->
        if request.sender_id == user_id or request.receiver_id == user_id,
          do: :ok,
          else: {:error, :unauthorized}

      _ ->
        {:error, :invalid_action}
    end
  end

  @doc """
  Disconnect from a user (decline an accepted connection).
  Either user in the connection can disconnect.
  This sets the connection status to declined, preventing further messages.
  """
  def disconnect(request, user_id) do
    # Verify user is authorized to disconnect (either sender or receiver)
    with :ok <- authorize_action(request, user_id, :disconnect),
         {:ok, updated_request} <-
           request
           |> ConnectionRequest.changeset(%{status: "declined"})
           |> Repo.update() do
      updated_request = Repo.preload(updated_request, [:sender, :receiver, :club, :intention])

      # Broadcast to both users
      other_user_id =
        if user_id == request.sender_id, do: request.receiver_id, else: request.sender_id

      BackendWeb.Endpoint.broadcast(
        "user:#{other_user_id}",
        "connection_disconnected",
        %{
          thread_id: request.thread_id,
          disconnected_by_user_id: user_id,
          request: BackendWeb.API.ConnectionRequestJSON.show(%{request: updated_request}).request
        }
      )

      {:ok, updated_request}
    end
  end

  @doc """
  Get connection request by thread_id.
  If there are multiple (due to duplicates), get the most recent non-declined one.
  """
  def get_request_by_thread(thread_id) do
    request =
      from(cr in ConnectionRequest,
        where: cr.thread_id == ^thread_id,
        where: cr.status != "declined",
        order_by: [desc: cr.inserted_at],
        limit: 1
      )
      |> Repo.one()

    case request do
      nil -> {:error, :not_found}
      request -> {:ok, Repo.preload(request, [:sender, :receiver, :club, :intention])}
    end
  end

  @doc """
  Get any connection request by thread_id (including declined ones).
  Used for reconnection to find and update existing declined requests.
  """
  def get_any_request_by_thread(thread_id) do
    request =
      from(cr in ConnectionRequest,
        where: cr.thread_id == ^thread_id,
        order_by: [desc: cr.updated_at],
        limit: 1
      )
      |> Repo.one()

    case request do
      nil -> {:error, :not_found}
      request -> {:ok, Repo.preload(request, [:sender, :receiver, :club, :intention])}
    end
  end

  @doc """
  Reconnect with a user by updating the existing declined connection request.
  Swaps sender/receiver if needed and sets status back to pending.
  """
  def reconnect(request, new_sender_id, message \\ "Let's reconnect!") do
    # Determine if we need to swap sender/receiver
    {sender_id, receiver_id} =
      if request.sender_id == new_sender_id do
        # Original sender wants to reconnect - swap roles
        {request.receiver_id, request.sender_id}
      else
        # Original receiver wants to reconnect - keep same roles
        {request.sender_id, request.receiver_id}
      end

    # Update the connection request
    request
    |> ConnectionRequest.changeset(%{
      sender_id: sender_id,
      receiver_id: receiver_id,
      status: "pending",
      message: message
    })
    |> Repo.update()
    |> case do
      {:ok, updated_request} ->
        updated_request = Repo.preload(updated_request, [:sender, :receiver, :club, :intention])

        # Broadcast to the receiver
        BackendWeb.Endpoint.broadcast(
          "user:#{receiver_id}",
          "new_connection_request",
          %{request: BackendWeb.API.ConnectionRequestJSON.show(%{request: updated_request}).request}
        )

        # Notify receiver via push
        reconnect_sender_name = updated_request.sender.name || "Someone"
        PushNotificationWorker.enqueue(
          receiver_id,
          "New connection request",
          "#{reconnect_sender_name} wants to reconnect with you",
          %{type: "connection_request", request_id: updated_request.id}
        )

        {:ok, updated_request}

      error ->
        error
    end
  end
end
