#!/usr/bin/env elixir

# Test position change and weeks on chart functionality
import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Testing Position Change & Weeks on Chart ===\n")

# Test all time periods
[:all, :month, :week]
|> Enum.each(fn period ->
  leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: period, limit: 10)

  IO.puts("\n#{String.upcase(to_string(period))} LEADERBOARD:")
  IO.puts(String.pad_trailing("Rank", 6) <> String.pad_trailing("Username", 20) <> String.pad_trailing("Amount", 12) <> String.pad_trailing("Position", 12) <> "Weeks")
  IO.puts(String.duplicate("-", 70))

  Enum.each(leaderboard, fn entry ->
    position_str = case entry.position_change do
      :new -> "⭐ New"
      0 -> "➖ Same"
      n when n > 0 -> "↑ +#{n}"
      n -> "↓ #{n}"
    end

    IO.puts(
      String.pad_trailing("##{entry.rank}", 6) <>
      String.pad_trailing(entry.username || "Unknown", 20) <>
      String.pad_trailing("R#{entry.amount}", 12) <>
      String.pad_trailing(position_str, 12) <>
      "#{entry.weeks_on_chart}w"
    )
  end)
end)

IO.puts("\n=== JSON API Response ===\n")

# Simulate API response for "all" period
leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 10)
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: leaderboard})

IO.puts(Jason.encode!(json_response, pretty: true))

IO.puts("\n✅ Position change shows:")
IO.puts("   - ⭐ 'new' for first-time chart entries")
IO.puts("   - ↑ +N for improved positions")
IO.puts("   - ↓ -N for dropped positions")
IO.puts("   - ➖ 'same' for unchanged positions")
IO.puts("\n✅ Weeks on chart calculated from first visit date")
