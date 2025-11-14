# lib/backend/connection_tracker.ex
defmodule Backend.ConnectionTracker do
  use GenServer

  # API
  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def track_connection(user_id, topic) do
    GenServer.cast(__MODULE__, {:track, user_id, topic})
  end

  def remove_connection(user_id, topic) do
    GenServer.cast(__MODULE__, {:remove, user_id, topic})
  end

  def get_user_connections(user_id) do
    GenServer.call(__MODULE__, {:get_connections, user_id})
  end

  def broadcast_to_all_user_connections(user_id, event, payload) do
    GenServer.cast(__MODULE__, {:broadcast, user_id, event, payload})
  end

  # Server
  def init(state) do
    {:ok, state}
  end

  def handle_cast({:track, user_id, topic}, state) do
    connections = Map.get(state, user_id, MapSet.new())
    new_connections = MapSet.put(connections, topic)
    new_state = Map.put(state, user_id, new_connections)
    {:noreply, new_state}
  end

  def handle_cast({:remove, user_id, topic}, state) do
    connections = Map.get(state, user_id, MapSet.new())
    new_connections = MapSet.delete(connections, topic)
    new_state = Map.put(state, user_id, new_connections)
    {:noreply, new_state}
  end

  def handle_cast({:broadcast, user_id, event, payload}, state) do
    connections = Map.get(state, user_id, MapSet.new())

    Enum.each(connections, fn topic ->
      BackendWeb.Endpoint.broadcast!(topic, event, payload)
    end)

    {:noreply, state}
  end

  def handle_call({:get_connections, user_id}, _from, state) do
    connections = Map.get(state, user_id, MapSet.new())
    {:reply, connections, state}
  end
end
