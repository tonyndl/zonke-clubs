#!/usr/bin/env elixir

# Final test showing correct time on chart calculations
import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== FINAL TIME ON CHART TEST ===\n")
IO.puts("Today: #{Date.utc_today()}\n")

# Test all periods
periods = [:week, :month, :all]

Enum.each(periods, fn period ->
  leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: period, limit: 5)

  period_name =
    case period do
      :week -> "WEEK (shows distinct DAYS in last 7 days)"
      :month -> "MONTH (shows distinct WEEKS in last 30 days)"
      :all -> "ALL TIME (shows total WEEKS since first visit)"
    end

  IO.puts("\n#{period_name}:")
  IO.puts(String.duplicate("=", 70))
  IO.puts(
    String.pad_trailing("Rank", 6) <>
      String.pad_trailing("Username", 20) <>
      String.pad_trailing("Amount", 12) <>
      "On Chart"
  )
  IO.puts(String.duplicate("-", 70))

  Enum.each(leaderboard, fn entry ->
    IO.puts(
      String.pad_trailing("##{entry.rank}", 6) <>
        String.pad_trailing(entry.username || "Unknown", 20) <>
        String.pad_trailing("R#{entry.amount}", 12) <>
        "#{entry.time_on_chart} #{entry.time_unit}"
    )
  end)
end)

IO.puts("\n\n=== EXPLANATION ===")
IO.puts("✅ WEEK period:")
IO.puts("   - Counts distinct DAYS with spending records in last 7 days")
IO.puts("   - Example: If you spent on Monday, Tuesday, and Friday = 3 days")
IO.puts("")
IO.puts("✅ MONTH period:")
IO.puts("   - Counts distinct WEEKS with spending records in last 30 days")
IO.puts("   - Example: If you spent in weeks 1, 2, and 4 = 3 weeks")
IO.puts("")
IO.puts("✅ ALL TIME period:")
IO.puts("   - Shows total weeks since first visit to the club")
IO.puts("   - Example: First visit was 8 weeks ago = 8 weeks")
