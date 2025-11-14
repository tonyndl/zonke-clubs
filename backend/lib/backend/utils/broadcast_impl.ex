defmodule Backend.Utils.BroadcastImpl do
  @behaviour Backend.Utils.Broadcast

  alias BackendWeb.Endpoint

  @impl true
  def broadcast(topic, event, payload) do
    Endpoint.broadcast(topic, event, payload)
  end

  @impl true
  def broadcast_from!(from, topic, event, payload) do
    Endpoint.broadcast_from!(from, topic, event, payload)
  end
end
