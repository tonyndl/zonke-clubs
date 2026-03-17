defmodule BackendWeb.Admin.EventJSON do
  @moduledoc """
  Renders event data in JSON format.
  """

  @doc """
  Renders a list of events.
  """
  def index(%{events: events, paginate: paginate}) do
    %{events: Enum.map(events, &data/1), paginate: paginate}
  end

  def index(%{events: events}) do
    %{events: Enum.map(events, &data/1)}
  end

  @doc """
  Renders a single event.
  """
  def show(%{event: event}) do
    %{event: data(event)}
  end

  defp data(event) do
    # Resolve DJ IDs/names to DJ objects if DJ map is available (for public endpoints)
    dj_lineup =
      if Map.has_key?(event, :_dj_map) and event._dj_map do
        name_map = Map.get(event, :_dj_name_map, %{})

        event.dj_lineup
        |> Enum.map(fn dj_id_or_name ->
          # First try to find by ID
          case Map.get(event._dj_map, dj_id_or_name) do
            nil ->
              # If not found by ID, try to find by name (for legacy data)
              case Map.get(name_map, dj_id_or_name) do
                nil -> %{id: dj_id_or_name, name: dj_id_or_name} # Fallback if not found
                dj -> %{id: dj.id, name: dj.name}
              end

            dj ->
              %{id: dj.id, name: dj.name}
          end
        end)
      else
        # For admin endpoints, keep as array of IDs
        event.dj_lineup
      end

    %{
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      general_entry_price: event.general_entry_price,
      vip_entry_price: event.vip_entry_price,
      dj_lineup: dj_lineup,
      cover_image: event.cover_image,
      status: event.status,
      admin_id: event.admin_id,
      inserted_at: event.inserted_at,
      updated_at: event.updated_at
    }
  end
end
