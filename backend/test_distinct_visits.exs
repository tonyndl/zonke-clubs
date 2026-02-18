#!/usr/bin/env elixir

# Test that time on chart correctly counts distinct days/weeks
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

# Get Prince
prince = Repo.one(from u in User, where: u.username == "Prince")

today = Date.utc_today()

IO.puts("\n=== Adding Test Records on Specific Dates ===\n")
IO.puts("Today: #{today}")

# Clear Prince's old records for clean test
Repo.delete_all(from s in SpendingRecord, where: s.user_id == ^prince.id)

# Add records on specific dates within the last week
test_dates = [
  {Date.add(today, -5), "5000.00", "5 days ago"},
  {Date.add(today, -5), "3000.00", "5 days ago (second record same day)"},
  {Date.add(today, -3), "6000.00", "3 days ago"},
  {Date.add(today, -1), "4000.00", "Yesterday"}
]

Enum.each(test_dates, fn {date, amount, note} ->
  attrs = %{
    club_id: zonke_club.id,
    user_id: prince.id,
    amount: Decimal.new(amount),
    visit_date: date,
    notes: note
  }

  case Backend.Spending.SpendingRecords.create_spending_record(attrs) do
    {:ok, _record} ->
      IO.puts("✓ #{date}: R#{amount} (#{note})")
    {:error, changeset} ->
      IO.puts("✗ Failed")
      IO.inspect(changeset.errors)
  end
end)

IO.puts("\n=== Expected: 3 distinct days (5 days ago, 3 days ago, yesterday) ===\n")

# Test week leaderboard
week_leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :week, limit: 10)

prince_entry = Enum.find(week_leaderboard, fn e -> e.username == "Prince" end)

if prince_entry do
  IO.puts("WEEK LEADERBOARD for Prince:")
  IO.puts("  Best Amount: R#{prince_entry.amount}")
  IO.puts("  Time on Chart: #{prince_entry.time_on_chart} #{prince_entry.time_unit}")
  IO.puts("  Expected: 3 days (distinct dates: #{Date.add(today, -5)}, #{Date.add(today, -3)}, #{Date.add(today, -1)})")

  if prince_entry.time_on_chart == 3 do
    IO.puts("\n✅ CORRECT! Counts distinct days, not total records")
  else
    IO.puts("\n❌ INCORRECT! Should be 3 distinct days, got #{prince_entry.time_on_chart}")
  end
else
  IO.puts("❌ Prince not found in leaderboard")
end

IO.puts("\n=== JSON Response ===\n")
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: week_leaderboard})
prince_json = Enum.find(json_response.leaderboard, fn e -> e.username == "Prince" end)

if prince_json do
  IO.inspect(prince_json, pretty: true)
end
