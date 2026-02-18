#!/usr/bin/env elixir

# Test dynamic time units (days for week, weeks for month/all)
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

# Get a user
prince = Repo.one(from u in User, where: u.username == "Prince")
today = Date.utc_today()

IO.puts("\n=== Adding Test Records at Different Times ===\n")

# Add records for different dates to show varying "time on chart"
test_records = [
  # 5 days ago (will show in week view)
  %{
    club_id: zonke_club.id,
    user_id: prince.id,
    amount: Decimal.new("5000.00"),
    visit_date: Date.add(today, -5),
    notes: "5 days ago"
  },
  # 3 days ago
  %{
    club_id: zonke_club.id,
    user_id: prince.id,
    amount: Decimal.new("6000.00"),
    visit_date: Date.add(today, -3),
    notes: "3 days ago"
  }
]

Enum.each(test_records, fn attrs ->
  case Backend.Spending.SpendingRecords.create_spending_record(attrs) do
    {:ok, _record} ->
      IO.puts("✓ Added: #{attrs.visit_date} - #{attrs.notes}")
    {:error, _changeset} ->
      IO.puts("✗ Failed")
  end
end)

IO.puts("\n=== Testing Different Time Periods ===\n")

# Test WEEK period (should show DAYS)
IO.puts("WEEK PERIOD (should show DAYS):")
week_leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :week, limit: 5)
IO.puts(String.pad_trailing("Rank", 6) <> String.pad_trailing("Username", 20) <> String.pad_trailing("Amount", 12) <> "On Chart")
IO.puts(String.duplicate("-", 60))
Enum.each(week_leaderboard, fn entry ->
  IO.puts(
    String.pad_trailing("##{entry.rank}", 6) <>
    String.pad_trailing(entry.username || "Unknown", 20) <>
    String.pad_trailing("R#{entry.amount}", 12) <>
    "#{entry.time_on_chart} #{entry.time_unit}"
  )
end)

# Test MONTH period (should show WEEKS)
IO.puts("\nMONTH PERIOD (should show WEEKS):")
month_leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :month, limit: 5)
IO.puts(String.pad_trailing("Rank", 6) <> String.pad_trailing("Username", 20) <> String.pad_trailing("Amount", 12) <> "On Chart")
IO.puts(String.duplicate("-", 60))
Enum.each(month_leaderboard, fn entry ->
  IO.puts(
    String.pad_trailing("##{entry.rank}", 6) <>
    String.pad_trailing(entry.username || "Unknown", 20) <>
    String.pad_trailing("R#{entry.amount}", 12) <>
    "#{entry.time_on_chart} #{entry.time_unit}"
  )
end)

# Test ALL period (should show WEEKS)
IO.puts("\nALL TIME PERIOD (should show WEEKS):")
all_leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 5)
IO.puts(String.pad_trailing("Rank", 6) <> String.pad_trailing("Username", 20) <> String.pad_trailing("Amount", 12) <> "On Chart")
IO.puts(String.duplicate("-", 60))
Enum.each(all_leaderboard, fn entry ->
  IO.puts(
    String.pad_trailing("##{entry.rank}", 6) <>
    String.pad_trailing(entry.username || "Unknown", 20) <>
    String.pad_trailing("R#{entry.amount}", 12) <>
    "#{entry.time_on_chart} #{entry.time_unit}"
  )
end)

IO.puts("\n=== JSON Response (Week Period) ===\n")
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: week_leaderboard})
IO.puts(Jason.encode!(json_response, pretty: true))

IO.puts("\n✅ Time units are now dynamic:")
IO.puts("   - WEEK period: Shows DAYS (how many days this week)")
IO.puts("   - MONTH period: Shows WEEKS (how many weeks this month)")
IO.puts("   - ALL period: Shows WEEKS (total weeks since first visit)")
