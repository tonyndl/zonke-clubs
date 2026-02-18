defmodule BackendWeb.API.DJScheduleController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.DJs

  # Helper function to convert day_of_week index to day name
  defp day_name_from_index(day_of_week) do
    case day_of_week do
      0 -> "Sun"
      1 -> "Mon"
      2 -> "Tue"
      3 -> "Wed"
      4 -> "Thu"
      5 -> "Fri"
      6 -> "Sat"
      _ -> "Unknown"
    end
  end

  def index(conn, _params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id) do
      schedules = DJs.list_schedules(club.id)

      IO.puts("\n=== ADMIN DJ SCHEDULE INDEX ===")
      IO.puts("Admin ID: #{session.id}")
      IO.puts("Club ID: #{club.id}")
      IO.puts("Club Name: #{club.name}")
      IO.puts("Number of schedules: #{length(schedules)}")
      Enum.each(schedules, fn s ->
        dj_name = if s.dj, do: s.dj.name, else: "Unknown DJ"
        day = day_name_from_index(s.day_of_week)
        IO.puts("  - #{dj_name} on #{day} (#{s.start_time || "N/A"} - #{s.end_time || "N/A"})")
      end)
      IO.puts("===============================\n")

      conn
      |> put_status(:ok)
      |> render(:index, schedules: schedules)
    end
  end

  def show(conn, %{"id" => id}, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, schedule} <- DJs.get_schedule(id, club.id) do
      conn
      |> put_status(:ok)
      |> render(:show, schedule: schedule)
    end
  end

  def create(conn, params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, schedule} <- DJs.create_schedule(params, club.id) do
      conn
      |> put_status(:created)
      |> render(:show, schedule: schedule)
    end
  end

  def update(conn, %{"id" => id} = params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, schedule} <- DJs.get_schedule(id, club.id),
         {:ok, updated_schedule} <- DJs.update_schedule(schedule, params) do
      conn
      |> put_status(:ok)
      |> render(:show, schedule: updated_schedule)
    end
  end

  def delete(conn, %{"id" => id}, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, schedule} <- DJs.get_schedule(id, club.id),
         {:ok, _} <- DJs.delete_schedule(schedule) do
      conn
      |> put_status(:ok)
      |> json(%{message: "Schedule deleted successfully"})
    end
  end

  @doc """
  Public endpoint to get DJ schedule for a specific club.
  Accepts optional `week_start` query param (YYYY-MM-DD, should be a Sunday).
  If omitted, defaults to the current week's Sunday.
  Returns weekly recurring schedules + specific-date schedules for that week.
  """
  def club_schedule(conn, %{"id" => club_id} = params, _session) do
    week_start =
      case Map.get(params, "week_start") do
        nil ->
          today = Date.utc_today()
          # Date.day_of_week with :sunday mode: Sunday=0 ... Saturday=6
          days_since_sunday = rem(Date.day_of_week(today, :sunday), 7)
          Date.add(today, -days_since_sunday)

        date_str ->
          case Date.from_iso8601(date_str) do
            {:ok, date} -> date
            _ ->
              today = Date.utc_today()
              Date.add(today, -rem(Date.day_of_week(today, :sunday), 7))
          end
      end

    schedules = DJs.list_schedules_for_week(club_id, week_start)

    conn
    |> put_status(:ok)
    |> render(:index, schedules: schedules)
  end
end
