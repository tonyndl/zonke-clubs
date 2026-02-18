#!/usr/bin/env elixir

# Check actual records for BigSpender and MediumSpenders
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

# Get users
big_spender = Repo.one(from u in User, where: u.username == "BigSpender")
medium1 = Repo.one(from u in User, where: u.username == "MediumSpender1")
medium2 = Repo.one(from u in User, where: u.username == "MediumSpender2")

today = Date.utc_today()
week_start = Date.add(today, -7)

IO.puts("\n=== Checking Actual Records ===")
IO.puts("Today: #{today}")
IO.puts("Week starts: #{week_start} (last 7 days)\n")

[
  {"BigSpender", big_spender},
  {"MediumSpender1", medium1},
  {"MediumSpender2", medium2}
]
|> Enum.each(fn {name, user} ->
  if user do
    # Get all records for this user in the last week
    records =
      Repo.all(
        from s in SpendingRecord,
          where: s.club_id == ^zonke_club.id,
          where: s.user_id == ^user.id,
          where: s.visit_date >= ^week_start,
          order_by: [desc: s.visit_date],
          select: %{visit_date: s.visit_date, amount: s.amount}
      )

    IO.puts("#{name}:")
    IO.puts("  Total records in last 7 days: #{length(records)}")

    if length(records) > 0 do
      IO.puts("  Records:")
      Enum.each(records, fn r ->
        IO.puts("    - #{r.visit_date}: R#{r.amount}")
      end)

      # Count distinct dates
      distinct_dates = Enum.uniq_by(records, & &1.visit_date) |> length()
      IO.puts("  Distinct dates: #{distinct_dates}")
    else
      IO.puts("  No records in last 7 days")
    end

    IO.puts("")
  end
end)

# Also show what the leaderboard returns
IO.puts("=== What Leaderboard Returns ===\n")
leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :week, limit: 10)

[big_spender, medium1, medium2]
|> Enum.each(fn user ->
  if user do
    entry = Enum.find(leaderboard, fn e -> e.user_id == user.id end)

    if entry do
      IO.puts("#{entry.username}: #{entry.time_on_chart} #{entry.time_unit}")
    end
  end
end)
