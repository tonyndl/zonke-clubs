#!/usr/bin/env elixir

import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Clubs.Club

IO.puts("\n=== CLUBS ===\n")
clubs = Repo.all(from c in Club, select: %{id: c.id, name: c.name})
Enum.each(clubs, fn club ->
  IO.puts("Club: #{club.name} (#{String.slice(club.id, 0..7)}...)")
end)

IO.puts("\n=== SPENDING RECORDS BY CLUB ===\n")

Enum.each(clubs, fn club ->
  records = Repo.all(from s in SpendingRecord,
    where: s.club_id == ^club.id,
    order_by: [desc: s.visit_date],
    preload: [:user]
  )

  IO.puts("\n#{club.name}:")
  IO.puts("  Total records: #{length(records)}")

  if length(records) > 0 do
    Enum.each(records, fn r ->
      username = if r.user, do: r.user.username, else: "Unknown"
      IO.puts("  - #{r.visit_date} | #{username} | R#{r.amount}")
    end)

    # Test leaderboard for this club
    leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(club.id, time_period: :all, limit: 10)
    IO.puts("\n  Leaderboard (All Time):")
    Enum.each(leaderboard, fn entry ->
      IO.puts("    #{entry.username || "Unknown"}: R#{entry.amount}")
    end)
  end
end)
