defmodule Backend.DJs do
  @moduledoc """
  Context for managing DJs and their schedules.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.DJs.{DJ, DJSchedule}
  alias Backend.Accounts.User

  # ── DJ User Functions (mobile DJ accounts) ───────────────────────────────────

  @doc "List all users with role=dj, ordered by username."
  def list_dj_users do
    User
    |> where([u], u.role == "dj")
    |> order_by([u], asc: u.username)
    |> Repo.all()
  end

  @doc "Search DJ users by username (case-insensitive partial match)."
  def search_dj_users(query) when is_binary(query) and byte_size(query) > 0 do
    pattern = "%#{query}%"

    User
    |> where([u], u.role == "dj")
    |> where([u], ilike(u.username, ^pattern))
    |> order_by([u], asc: u.username)
    |> limit(20)
    |> Repo.all()
  end

  def search_dj_users(_), do: list_dj_users()

  @doc "List all schedules where dj_user_id matches the given user, ordered by date."
  def list_dj_user_schedules(user_id) do
    DJSchedule
    |> where([s], s.dj_user_id == ^user_id)
    |> preload(:club)
    |> order_by([s], [asc: s.type, asc: s.day_of_week, asc: s.specific_date, asc: s.start_time])
    |> Repo.all()
  end

  @doc "Get a single DJ user by ID."
  def get_dj_user(id) do
    case Repo.get_by(User, id: id, role: "dj") do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  @doc "Update a DJ user's profile fields."
  def update_dj_profile(%User{role: "dj"} = user, attrs) do
    user
    |> User.dj_profile_changeset(attrs)
    |> Repo.update()
  end

  def update_dj_profile(_, _), do: {:error, :unauthorized}

  # ── Legacy DJ Record Functions (club-created DJs) ─────────────────────────────

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
    |> preload([:dj, :dj_user])
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
    |> preload([:dj, :dj_user])
    |> order_by([s], [asc: s.day_of_week, asc: s.specific_date, asc: s.start_time])
    |> Repo.all()
  end

  def get_schedule(id, club_id) do
    case Repo.get_by(DJSchedule, id: id, club_id: club_id) do
      nil -> {:error, :not_found}
      schedule -> {:ok, Repo.preload(schedule, [:dj, :dj_user])}
    end
  end

  def create_schedule(attrs, club_id) do
    attrs = Map.put(attrs, "club_id", club_id)

    %DJSchedule{}
    |> DJSchedule.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schedule} -> {:ok, Repo.preload(schedule, [:dj, :dj_user])}
      error -> error
    end
  end

  def update_schedule(schedule, attrs) do
    schedule
    |> DJSchedule.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, schedule} -> {:ok, Repo.preload(schedule, [:dj, :dj_user])}
      error -> error
    end
  end

  def delete_schedule(schedule) do
    Repo.delete(schedule)
  end
end
