#!/usr/bin/env elixir

# Check spending records and their dates
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord

# Get all spending records
records = Repo.all(from s in SpendingRecord,
  order_by: [desc: s.visit_date],
  select: %{
    id: s.id,
    user_id: s.user_id,
    amount: s.amount,
    visit_date: s.visit_date,
    inserted_at: s.inserted_at
  }
)

IO.puts("\n=== Spending Records (Total: #{length(records)}) ===\n")

Enum.each(records, fn record ->
  IO.puts("Date: #{record.visit_date} | Amount: R#{record.amount} | User: #{String.slice(record.user_id, 0..7)}")
end)

# Check date distribution
today = Date.utc_today()
week_ago = Date.add(today, -7)
month_ago = Date.add(today, -30)

week_count = Enum.count(records, fn r -> Date.compare(r.visit_date, week_ago) in [:gt, :eq] end)
month_count = Enum.count(records, fn r -> Date.compare(r.visit_date, month_ago) in [:gt, :eq] end)

IO.puts("\n=== Date Distribution ===")
IO.puts("Today: #{today}")
IO.puts("Last 7 days: #{week_count} records")
IO.puts("Last 30 days: #{month_count} records")
IO.puts("All time: #{length(records)} records")

# Test the leaderboard function
IO.puts("\n=== Testing Leaderboard Function ===")

# Get club_id from first record
if length(records) > 0 do
  club_id = Repo.one!(from s in SpendingRecord, limit: 1, select: s.club_id)

  IO.puts("Club ID: #{club_id}")

  # Test all time
  all_time = Backend.Spending.SpendingRecords.get_leaderboard(club_id, time_period: :all, limit: 10)
  IO.puts("\nAll Time Leaderboard: #{length(all_time)} users")
  Enum.each(all_time, fn entry ->
    IO.puts("  #{entry.username || "Unknown"}: R#{entry.amount}")
  end)

  # Test week
  week = Backend.Spending.SpendingRecords.get_leaderboard(club_id, time_period: :week, limit: 10)
  IO.puts("\nWeek Leaderboard: #{length(week)} users")
  Enum.each(week, fn entry ->
    IO.puts("  #{entry.username || "Unknown"}: R#{entry.amount}")
  end)

  # Test month
  month = Backend.Spending.SpendingRecords.get_leaderboard(club_id, time_period: :month, limit: 10)
  IO.puts("\nMonth Leaderboard: #{length(month)} users")
  Enum.each(month, fn entry ->
    IO.puts("  #{entry.username || "Unknown"}: R#{entry.amount}")
  end)
else
  IO.puts("No spending records found!")
end
