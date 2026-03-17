defmodule BackendWeb.Admin.EventController do
  use BackendWeb, :controller

  alias Backend.Admin.Events

  action_fallback BackendWeb.FallbackController

  @doc """
  Lists all events for the current admin.
  """
  def index(conn, params, session) do
    {events, paginate} = Events.list_events(session, params)

    conn
    |> put_status(:ok)
    |> render(:index, events: events, paginate: paginate)
  end

  @doc """
  Gets a single event by ID.
  """
  def show(conn, %{"id" => id}, session) do
    with {:ok, event} <- Events.get_event(id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, event: event)
    end
  end

  @doc """
  Creates a new event.
  """
  def create(conn, params, session) do
    with {:ok, event} <- Events.create_event(params, session) do
      conn
      |> put_status(:created)
      |> render(:show, event: event)
    end
  end

  @doc """
  Updates an existing event.
  """
  def update(conn, %{"id" => id} = params, session) do
    with {:ok, event} <- Events.update_event(id, params, session) do
      conn
      |> put_status(:ok)
      |> render(:show, event: event)
    end
  end

  @doc """
  Deletes an event.
  """
  def delete(conn, %{"id" => id}, session) do
    with {:ok, _event} <- Events.delete_event(id, session) do
      conn
      |> put_status(:no_content)
      |> send_resp(:no_content, "")
    end
  end

  @doc """
  Publishes an event.
  """
  def publish(conn, %{"id" => id}, session) do
    with {:ok, event} <- Events.publish_event(id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, event: event)
    end
  end

  @doc """
  Unpublishes an event.
  """
  def unpublish(conn, %{"id" => id}, session) do
    with {:ok, event} <- Events.unpublish_event(id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, event: event)
    end
  end

  @doc """
  Deletes all past events (date before today) and their S3 cover images.
  """
  def cleanup_past(conn, _params, session) do
    with {:ok, result} <- Events.delete_past_events(session) do
      conn
      |> put_status(:ok)
      |> json(%{deleted: result.deleted, s3_errors: result.s3_errors})
    end
  end

  @doc """
  Public endpoint to get published events for a specific club.
  Used by mobile app to display upcoming events.
  Only returns published events.
  """
  def club_events(conn, %{"id" => club_id}, _session) do
    events = Events.list_club_events(club_id)

    IO.puts("\n=== MOBILE CLUB EVENTS REQUEST ===")
    IO.puts("Requested Club ID: #{club_id}")
    IO.puts("Number of published events: #{length(events)}")
    Enum.each(events, fn e ->
      dj_names = if Map.has_key?(e, :_dj_map) do
        # Event has DJ map, so dj_lineup will be resolved to objects in JSON
        Enum.map(e.dj_lineup, fn dj_id_or_name ->
          case Map.get(e._dj_map, dj_id_or_name) do
            nil ->
              case Map.get(Map.get(e, :_dj_name_map, %{}), dj_id_or_name) do
                nil -> dj_id_or_name
                dj -> dj.name
              end
            dj -> dj.name
          end
        end)
        |> Enum.join(", ")
      else
        # Admin endpoint - just show the raw lineup
        Enum.join(e.dj_lineup, ", ")
      end

      IO.puts("  - \"#{e.title}\" on #{e.date} (#{e.start_time}) with DJs: #{dj_names}")
    end)
    IO.puts("===================================\n")

    conn
    |> put_status(:ok)
    |> render(:index, events: events)
  end
end
