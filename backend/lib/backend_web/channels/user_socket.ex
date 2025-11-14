defmodule BackendWeb.UserSocket do
  use Phoenix.Socket

  alias Backend.Guardian

  ## Channels
  channel("users:*", BackendWeb.UserChannel)
  channel("chats:*", BackendWeb.MessengerChannel)
  channel("reviews:*", BackendWeb.ReviewChannel)

  # Transport configuration
  # transport(:websocket, Phoenix.Transports.WebSocket)
  # transport(:longpoll, Phoenix.Transports.LongPoll)

  # Authenticate and verify the user when they connect
  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    with {:ok, claims} <- Guardian.decode_and_verify(token),
         {:ok, %{user_id: user_id}} <- Guardian.resource_from_claims(claims) do
      {:ok, assign(socket, :user_id, user_id)}
    else
      {:error, error} ->
        {:error, error}

      _ ->
        :error
    end
  end

  # def connect(_params, socket, _connect_info) do
  #   {:ok, socket}
  # end

  def connect(_params, _socket, _connect_info), do: :error

  # Socket id's are topics that allow you to identify all sockets for a given user:
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  # Returning `nil` makes this socket anonymous.
  # @impl true
  # def id(_socket), do: nil
end
