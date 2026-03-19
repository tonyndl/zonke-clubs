defmodule BackendWeb.UserSocket do
  use Phoenix.Socket

  # Channels
  channel "user:*", BackendWeb.UserChannel
  channel "thread:*", BackendWeb.ThreadChannel
  channel "presence:lobby", BackendWeb.PresenceLobbyChannel
  channel "strobe:*", BackendWeb.StrobeChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    # Verify the user token
    case Backend.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        case Backend.Guardian.resource_from_claims(claims) do
          {:ok, %{user_id: user_id}} ->
            {:ok, assign(socket, :user_id, user_id)}

          {:error, _reason} ->
            :error
        end

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
