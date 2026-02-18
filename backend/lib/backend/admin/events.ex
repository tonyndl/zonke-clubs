defmodule Backend.Admin.Events do
  @moduledoc """
  Context for managing events.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.Admin.{Admin, Event}

  @doc """
  Lists all events for a specific admin.
  Returns events ordered by date (most recent first).
  """
  def list_events(%Admin{} = admin) do
    Event
    |> where([e], e.admin_id == ^admin.id)
    |> order_by([e], desc: e.date, desc: e.inserted_at)
    |> Repo.all()
  end

  @doc """
  Lists all published events (public endpoint).
  Returns events ordered by date (upcoming first).
  """
  def list_published_events do
    today = Date.utc_today()

    Event
    |> where([e], e.status == "published" and e.date >= ^today)
    |> order_by([e], asc: e.date)
    |> Repo.all()
  end

  @doc """
  Gets a single event by ID.
  """
  def get_event(id, %Admin{} = admin) do
    case Repo.get_by(Event, id: id, admin_id: admin.id) do
      nil -> {:error, :not_found}
      event -> {:ok, event}
    end
  end

  @doc """
  Gets a single published event by ID (public endpoint).
  """
  def get_published_event(id) do
    case Repo.get_by(Event, id: id, status: "published") do
      nil -> {:error, :not_found}
      event -> {:ok, event}
    end
  end

  @doc """
  Creates an event.
  """
  def create_event(attrs, %Admin{} = admin) do
    attrs = Map.put(attrs, "admin_id", admin.id)

    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates an event.
  Only allows updating if the event belongs to the admin.
  """
  def update_event(id, attrs, %Admin{} = admin) do
    with {:ok, event} <- get_event(id, admin) do
      event
      |> Event.changeset(attrs)
      |> Repo.update()
    end
  end

  @doc """
  Deletes an event.
  Only allows deleting if the event belongs to the admin.
  """
  def delete_event(id, %Admin{} = admin) do
    with {:ok, event} <- get_event(id, admin) do
      Repo.delete(event)
    end
  end

  @doc """
  Publishes an event (changes status from draft to published).
  """
  def publish_event(id, %Admin{} = admin) do
    update_event(id, %{"status" => "published"}, admin)
  end

  @doc """
  Unpublishes an event (changes status from published to draft).
  """
  def unpublish_event(id, %Admin{} = admin) do
    update_event(id, %{"status" => "draft"}, admin)
  end

  @doc """
  Deletes all past events (date < today) for the given admin.
  Also deletes their cover_image files from S3 if present.
  Returns {:ok, %{deleted: count, s3_errors: [filenames]}} on success.
  """
  def delete_past_events(%Admin{} = admin) do
    today = Date.utc_today()

    past_events =
      Event
      |> where([e], e.admin_id == ^admin.id and e.date < ^today)
      |> Repo.all()

    s3_errors =
      past_events
      |> Enum.filter(fn e -> e.cover_image != nil end)
      |> Enum.flat_map(fn event ->
        case Backend.Assets.delete_object(event.cover_image) do
          {:ok, _} -> []
          {:error, _} -> [event.cover_image]
        end
      end)

    {deleted, _} =
      Event
      |> where([e], e.admin_id == ^admin.id and e.date < ^today)
      |> Repo.delete_all()

    {:ok, %{deleted: deleted, s3_errors: s3_errors}}
  end

  @doc """
  Counts upcoming published events for an admin.
  Returns the count of published events with date >= today.
  """
  def count_upcoming_events(%Admin{} = admin) do
    today = Date.utc_today()

    Event
    |> where([e], e.admin_id == ^admin.id and e.status == "published" and e.date >= ^today)
    |> Repo.aggregate(:count)
  end

  @doc """
  Lists all published events for a specific club (public endpoint).
  Returns upcoming published events ordered by date.
  Also fetches DJ data to resolve DJ IDs to names.
  """
  def list_club_events(club_id) do
    today = Date.utc_today()

    # Get the admin ID for this club
    case Backend.Clubs.get_club(club_id) do
      {:ok, club} ->
        # If club has no admin (user-owned club), return empty list
        # Only admin-owned clubs can have events
        if is_nil(club.admin_id) do
          []
        else
          events =
            Event
            |> where([e], e.admin_id == ^club.admin_id and e.status == "published" and e.date >= ^today)
            |> order_by([e], asc: e.date, asc: e.start_time)
            |> Repo.all()

          # Fetch all DJs for this club to resolve DJ IDs
          djs = Backend.DJs.list_djs(club_id)
          dj_map = Map.new(djs, fn dj -> {dj.id, dj} end)

          # Also add DJ name -> DJ mapping for legacy data (events that stored names instead of IDs)
          name_map = Map.new(djs, fn dj -> {dj.name, dj} end)

          # Attach both maps to each event for the JSON view
          Enum.map(events, fn event ->
            event
            |> Map.put(:_dj_map, dj_map)
            |> Map.put(:_dj_name_map, name_map)
          end)
        end

      {:error, _} ->
        []
    end
  end
end
