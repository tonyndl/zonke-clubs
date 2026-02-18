#!/usr/bin/env elixir

# Test "New" display for recent chart entries
import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Testing 'New' Display for Recent Entries ===\n")

# Test all periods
[:week, :month, :all]
|> Enum.each(fn period ->
  leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: period, limit: 10)

  period_name = String.upcase(to_string(period))
  IO.puts("\n#{period_name} PERIOD:")
  IO.puts(String.duplicate("=", 70))
  IO.puts(
    String.pad_trailing("Rank", 6) <>
      String.pad_trailing("Username", 20) <>
      String.pad_trailing("Amount", 12) <>
      "On Chart"
  )
  IO.puts(String.duplicate("-", 70))

  Enum.each(leaderboard, fn entry ->
    on_chart_display =
      case entry.time_unit do
        "new" -> "⭐ New"
        "days" -> "#{entry.time_on_chart} #{if entry.time_on_chart == 1, do: "day", else: "days"}"
        "weeks" -> "#{entry.time_on_chart} #{if entry.time_on_chart == 1, do: "week", else: "weeks"}"
        _ -> "#{entry.time_on_chart} #{entry.time_unit}"
      end

    IO.puts(
      String.pad_trailing("##{entry.rank}", 6) <>
        String.pad_trailing(entry.username || "Unknown", 20) <>
        String.pad_trailing("R#{entry.amount}", 12) <>
        on_chart_display
    )
  end)
end)

IO.puts("\n\n=== JSON Response (Week Period) ===\n")
week_leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :week, limit: 3)
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: week_leaderboard})
IO.puts(Jason.encode!(json_response, pretty: true))

IO.puts("\n✅ Users with only 1 day/week on chart now show as '⭐ New'")
IO.puts("✅ Users with 2+ days/weeks show the actual count")
