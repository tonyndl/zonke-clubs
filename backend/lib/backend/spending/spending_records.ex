defmodule Backend.Spending.SpendingRecords do
  @moduledoc """
  Context for managing spending records and leaderboards.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Spending.SpendingRecord
  alias Backend.Accounts.User

  @doc """
  Creates a single spending record.
  """
  def create_spending_record(attrs) do
    %SpendingRecord{}
    |> SpendingRecord.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Creates multiple spending records for a group outing (bill split).
  Generates a unique group_outing_id to link all records.
  """
  def create_group_spending(attrs_list) when is_list(attrs_list) do
    group_id = Ecto.UUID.generate()

    changesets =
      Enum.map(attrs_list, fn attrs ->
        attrs_with_group = Map.put(attrs, "group_outing_id", group_id)
        SpendingRecord.changeset(%SpendingRecord{}, attrs_with_group)
      end)

    # Check if all changesets are valid
    if Enum.all?(changesets, & &1.valid?) do
      records =
        Enum.map(changesets, fn changeset ->
          {:ok, record} = Repo.insert(changeset)
          record
        end)

      {:ok, records}
    else
      invalid_changeset = Enum.find(changesets, &(not &1.valid?))
      {:error, invalid_changeset}
    end
  end

  @doc """
  Gets all spending records for a specific club, preloaded with user data.
  """
  def list_spending_records(club_id, opts \\ []) do
    limit = Keyword.get(opts, :limit)

    query =
      from s in SpendingRecord,
        where: s.club_id == ^club_id,
        order_by: [desc: s.visit_date, desc: s.inserted_at],
        preload: [:user]

    query =
      if limit do
        from q in query, limit: ^limit
      else
        query
      end

    Repo.all(query)
  end

  @doc """
  Gets leaderboard for a club - top unique users by their best single-night performance.
  Returns up to 10 users ranked by their highest spending in one visit.
  Each user appears only once with their best night.
  """
  def get_leaderboard(club_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 10)
    time_period = Keyword.get(opts, :time_period, :all)

    # Build date filter based on time period
    date_filter =
      case time_period do
        :week ->
          date_from = Date.add(Date.utc_today(), -7)
          dynamic([s], s.visit_date >= ^date_from)

        :month ->
          date_from = Date.add(Date.utc_today(), -30)
          dynamic([s], s.visit_date >= ^date_from)

        :all ->
          true
      end

    # Get the best (maximum) spending for each unique user
    query =
      from s in SpendingRecord,
        where: s.club_id == ^club_id,
        where: ^date_filter,
        group_by: s.user_id,
        select: %{
          user_id: s.user_id,
          best_amount: max(s.amount),
          visit_date: fragment("(array_agg(? ORDER BY ? DESC))[1]", s.visit_date, s.amount)
        },
        order_by: [desc: max(s.amount)],
        limit: ^limit

    results = Repo.all(query)

    # Preload user data
    user_ids = Enum.map(results, & &1.user_id)
    users = Repo.all(from u in User, where: u.id in ^user_ids)
    users_map = Map.new(users, &{&1.id, &1})

    # Get distinct visit counts for each user based on time period
    today = Date.utc_today()

    distinct_visits =
      case time_period do
        :week ->
          # Count distinct days in last 7 days
          week_start = Date.add(today, -7)

          Repo.all(
            from s in SpendingRecord,
              where: s.club_id == ^club_id and s.user_id in ^user_ids,
              where: s.visit_date >= ^week_start,
              group_by: s.user_id,
              select: %{
                user_id: s.user_id,
                count: fragment("COUNT(DISTINCT ?)", s.visit_date)
              }
          )
          |> Map.new(&{&1.user_id, &1.count})

        :month ->
          # Count distinct weeks in last 30 days (group by week)
          month_start = Date.add(today, -30)

          Repo.all(
            from s in SpendingRecord,
              where: s.club_id == ^club_id and s.user_id in ^user_ids,
              where: s.visit_date >= ^month_start,
              group_by: s.user_id,
              select: %{
                user_id: s.user_id,
                # Count distinct weeks (ISO week number)
                count:
                  fragment(
                    "COUNT(DISTINCT EXTRACT(WEEK FROM ?))",
                    s.visit_date
                  )
              }
          )
          |> Map.new(&{&1.user_id, &1.count})

        :all ->
          # Get first visit date for total weeks calculation
          Repo.all(
            from s in SpendingRecord,
              where: s.club_id == ^club_id and s.user_id in ^user_ids,
              group_by: s.user_id,
              select: %{user_id: s.user_id, first_visit: min(s.visit_date)}
          )
          |> Map.new(&{&1.user_id, &1.first_visit})
      end

    # Get previous period leaderboard for position change calculation
    previous_period = get_previous_period(time_period)

    previous_leaderboard =
      if previous_period do
        get_leaderboard_internal(club_id, previous_period, limit)
        |> Enum.with_index(1)
        |> Map.new(fn {entry, index} -> {entry.user_id, index} end)
      else
        %{}
      end

    # Add ranking with tie handling, position change, and time on chart
    results
    |> Enum.with_index(1)
    |> Enum.map_reduce(nil, fn {result, index}, prev_state ->
      user = Map.get(users_map, result.user_id)

      # Determine rank: if amount equals previous amount, use previous rank; otherwise use current index
      rank =
        case prev_state do
          {prev_amount, prev_rank} when not is_nil(prev_amount) ->
            if Decimal.equal?(result.best_amount, prev_amount), do: prev_rank, else: index

          _ ->
            index
        end

      # Calculate position change
      previous_rank = Map.get(previous_leaderboard, result.user_id)

      position_change =
        cond do
          is_nil(previous_rank) -> :new
          previous_rank > rank -> previous_rank - rank
          previous_rank < rank -> -(rank - previous_rank)
          true -> 0
        end

      # Calculate time on chart based on period
      {time_on_chart, time_unit} =
        case time_period do
          :week ->
            # Number of distinct days with spending in last 7 days
            days = Map.get(distinct_visits, result.user_id, 1)
            # If only 1 day, show as "new"
            if days == 1, do: {nil, "new"}, else: {days, "days"}

          :month ->
            # Number of distinct weeks with spending in last 30 days
            weeks = Map.get(distinct_visits, result.user_id, 1)
            # If only 1 week, show as "new"
            if weeks == 1, do: {nil, "new"}, else: {weeks, "weeks"}

          :all ->
            # Total weeks since first visit
            first_visit = Map.get(distinct_visits, result.user_id)

            weeks =
              if first_visit do
                max(1, div(Date.diff(today, first_visit), 7))
              else
                1
              end

            # If only 1 week, show as "new"
            if weeks == 1, do: {nil, "new"}, else: {weeks, "weeks"}
        end

      entry = %{
        rank: rank,
        user_id: result.user_id,
        username: user && user.username,
        avatar_url: user && user.avatar_url,
        amount: result.best_amount,
        visit_date: result.visit_date,
        position_change: position_change,
        time_on_chart: time_on_chart,
        time_unit: time_unit
      }

      {entry, {result.best_amount, rank}}
    end)
    |> elem(0)
  end

  # Helper to get previous period for comparison
  defp get_previous_period(:week), do: :previous_week
  defp get_previous_period(:month), do: :previous_month
  defp get_previous_period(:all), do: nil

  # Internal function to get leaderboard with custom date ranges
  defp get_leaderboard_internal(club_id, period, limit) do
    # Build date filter for previous period
    date_filter =
      case period do
        :previous_week ->
          date_from = Date.add(Date.utc_today(), -14)
          date_to = Date.add(Date.utc_today(), -7)
          dynamic([s], s.visit_date >= ^date_from and s.visit_date < ^date_to)

        :previous_month ->
          date_from = Date.add(Date.utc_today(), -60)
          date_to = Date.add(Date.utc_today(), -30)
          dynamic([s], s.visit_date >= ^date_from and s.visit_date < ^date_to)

        _ ->
          true
      end

    query =
      from s in SpendingRecord,
        where: s.club_id == ^club_id,
        where: ^date_filter,
        group_by: s.user_id,
        select: %{
          user_id: s.user_id,
          best_amount: max(s.amount)
        },
        order_by: [desc: max(s.amount)],
        limit: ^limit

    Repo.all(query)
  end

  @doc """
  Gets total spending statistics for a club.
  """
  def get_club_stats(club_id) do
    query =
      from s in SpendingRecord,
        where: s.club_id == ^club_id,
        select: %{
          total_spending: sum(s.amount),
          total_records: count(s.id),
          average_spending: avg(s.amount),
          max_spending: max(s.amount)
        }

    Repo.one(query) || %{total_spending: 0, total_records: 0, average_spending: 0, max_spending: 0}
  end

  @doc """
  Gets spending history for a specific user in a club.
  """
  def get_user_spending_history(user_id, club_id, opts \\ []) do
    limit = Keyword.get(opts, :limit)

    query =
      from s in SpendingRecord,
        where: s.user_id == ^user_id and s.club_id == ^club_id,
        order_by: [desc: s.visit_date, desc: s.inserted_at]

    query =
      if limit do
        from q in query, limit: ^limit
      else
        query
      end

    Repo.all(query)
  end

  @doc """
  Gets spending history for a user across all clubs, with club info preloaded.
  """
  def get_user_spending_all_clubs(user_id, opts \\ []) do
    limit = Keyword.get(opts, :limit)

    query =
      from s in SpendingRecord,
        where: s.user_id == ^user_id,
        order_by: [desc: s.visit_date, desc: s.inserted_at],
        preload: [:club]

    query =
      if limit do
        from q in query, limit: ^limit
      else
        query
      end

    Repo.all(query)
  end

  @doc """
  Gets overall spending statistics for a user across all clubs.
  """
  def get_user_stats(user_id) do
    query =
      from s in SpendingRecord,
        where: s.user_id == ^user_id,
        select: %{
          total_spending: sum(s.amount),
          total_visits: count(s.id, :distinct),
          average_spending: avg(s.amount),
          max_spending: max(s.amount),
          clubs_visited: count(s.club_id, :distinct)
        }

    result = Repo.one(query)

    # Get favorite club (most visited)
    favorite_club_query =
      from s in SpendingRecord,
        where: s.user_id == ^user_id,
        group_by: s.club_id,
        select: %{
          club_id: s.club_id,
          visit_count: count(s.id)
        },
        order_by: [desc: count(s.id)],
        limit: 1

    favorite_club = Repo.one(favorite_club_query)

    # Fetch club details if favorite club exists
    favorite_club_data =
      if favorite_club do
        club = Repo.get(Backend.Clubs.Club, favorite_club.club_id)

        if club do
          %{
            id: club.id,
            name: club.name,
            visit_count: favorite_club.visit_count
          }
        else
          nil
        end
      else
        nil
      end

    result
    |> Map.put(:favorite_club, favorite_club_data)
  end

  @doc """
  Gets the user's leaderboard rankings at clubs where they are in the top 10.
  Returns a list of %{club_id, club_name, rank, best_amount}.
  """
  def get_user_rankings(user_id) do
    # Get all clubs the user has spending records at
    club_ids =
      from(s in SpendingRecord,
        where: s.user_id == ^user_id,
        select: s.club_id,
        distinct: true
      )
      |> Repo.all()

    # For each club, get the leaderboard and find the user's rank
    club_ids
    |> Enum.map(fn club_id ->
      leaderboard = get_leaderboard(club_id, limit: 10, time_period: :all)

      leaderboard
      |> Enum.find(fn entry -> entry.user_id == user_id end)
      |> case do
        nil ->
          nil

        entry ->
          club = Repo.get(Backend.Clubs.Club, club_id)
          %{
            club_id: club_id,
            club_name: if(club, do: club.name, else: "Unknown"),
            rank: entry.rank,
            best_amount: if(is_struct(entry.amount, Decimal), do: Decimal.to_float(entry.amount), else: entry.amount)
          }
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(& &1.rank)
  end

  @doc """
  Gets spending statistics for a user at a specific club.
  """
  def get_user_club_stats(user_id, club_id) do
    query =
      from s in SpendingRecord,
        where: s.user_id == ^user_id and s.club_id == ^club_id,
        select: %{
          total_spending: sum(s.amount),
          total_visits: count(s.id),
          average_spending: avg(s.amount),
          max_spending: max(s.amount),
          min_spending: min(s.amount)
        }

    Repo.one(query) || %{
      total_spending: 0,
      total_visits: 0,
      average_spending: 0,
      max_spending: 0,
      min_spending: 0
    }
  end
end
