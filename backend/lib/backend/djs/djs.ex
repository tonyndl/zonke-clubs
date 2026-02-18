defmodule Backend.DJs do
  @moduledoc """
  Context for managing DJs and their schedules.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.DJs.{DJ, DJSchedule}

  # DJ Functions

  def list_djs(club_id) do
    DJ
    |> where([d], d.club_id == ^club_id)
    |> order_by([d], asc: d.name)
    |> Repo.all()
  end

  def get_dj(id, club_id) do
    case Repo.get_by(DJ, id: id, club_id: club_id) do
      nil -> {:error, :not_found}
      dj -> {:ok, dj}
    end
  end

  def create_dj(attrs, club_id) do
    attrs = Map.put(attrs, "club_id", club_id)

    %DJ{}
    |> DJ.changeset(attrs)
    |> Repo.insert()
  end

  def update_dj(dj, attrs) do
    dj
    |> DJ.changeset(attrs)
    |> Repo.update()
  end

  def delete_dj(dj) do
    Repo.delete(dj)
  end

  # DJ Schedule Functions

  def list_schedules(club_id) do
    DJSchedule
    |> where([s], s.club_id == ^club_id)
    |> preload(:dj)
    |> order_by([s], [asc: s.day_of_week, asc: s.start_time])
    |> Repo.all()
  end

  @doc """
  Returns schedules for a specific week (Sunday–Saturday).
  Returns all weekly (recurring) schedules plus any specific-date schedules
  whose specific_date falls within that week. Mobile handles merging/overriding.
  """
  def list_schedules_for_week(club_id, week_start) do
    week_end = Date.add(week_start, 6)

    DJSchedule
    |> where([s], s.club_id == ^club_id)
    |> where(
      [s],
      s.type == "weekly" or
        (s.type == "specific" and s.specific_date >= ^week_start and s.specific_date <= ^week_end)
    )
    |> preload(:dj)
    |> order_by([s], [asc: s.day_of_week, asc: s.specific_date, asc: s.start_time])
    |> Repo.all()
  end

  def get_schedule(id, club_id) do
    case Repo.get_by(DJSchedule, id: id, club_id: club_id) do
      nil -> {:error, :not_found}
      schedule -> {:ok, Repo.preload(schedule, :dj)}
    end
  end

  def create_schedule(attrs, club_id) do
    attrs = Map.put(attrs, "club_id", club_id)

    %DJSchedule{}
    |> DJSchedule.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schedule} -> {:ok, Repo.preload(schedule, :dj)}
      error -> error
    end
  end

  def update_schedule(schedule, attrs) do
    schedule
    |> DJSchedule.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, schedule} -> {:ok, Repo.preload(schedule, :dj)}
      error -> error
    end
  end

  def delete_schedule(schedule) do
    Repo.delete(schedule)
  end
end
