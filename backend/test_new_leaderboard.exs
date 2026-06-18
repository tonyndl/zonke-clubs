#!/usr/bin/env elixir

import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Testing NEW Leaderboard (Top 10 Records by Amount) ===\n")

# Test all time periods
[:all, :month, :week]
|> Enum.each(fn period ->
  leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: period, limit: 10)

  IO.puts("#{String.upcase(to_string(period))} - #{length(leaderboard)} records:")
  leaderboard
  |> Enum.with_index(1)
  |> Enum.each(fn {entry, rank} ->
    IO.puts("  #{rank}. #{entry.username}: R#{entry.amount} on #{entry.visit_date}")
  end)
  IO.puts("")
end)

IO.puts("✅ The same person can now appear multiple times if they have multiple high-spending nights!")
