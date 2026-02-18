defmodule BackendWeb.PresenceLobbyChannel do
  @moduledoc """
  Channel for broadcasting presence updates to all connected users.
  This is a public broadcast channel that all authenticated users can join.
  """
  use BackendWeb, :channel

  @impl true
  def join("presence:lobby", _payload, socket) do
    # Anyone who is authenticated can join the lobby
    {:ok, socket}
  end

  @impl true
  def handle_in("ping", _payload, socket) do
    {:reply, {:ok, %{message: "pong"}}, socket}
  end
end
