#!/usr/bin/env elixir

# Add test spending records with different dates to verify time filtering
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User

# Get ZONKE club
zonke_club = Repo.one!(from c in Backend.Clubs.Club, where: c.name == "ZONKE")

# Get existing users (Prince and Toni)
prince = Repo.one!(from u in User, where: u.username == "Prince")
toni = Repo.one!(from u in User, where: u.username == "Toni")

# Create a new test user
{:ok, old_spender} = Backend.Accounts.Registration.register_user(%{
  "username" => "OldSpender",
  "password" => "password123",
  "role" => "club_goer"
})

today = Date.utc_today()

# Add records from different time periods
records_to_create = [
  # 2 months ago (will only show in "All Time")
  %{
    club_id: zonke_club.id,
    user_id: old_spender.id,
    amount: Decimal.new("15000.00"),
    visit_date: Date.add(today, -60),
    notes: "Epic night 2 months ago"
  },

  # 20 days ago (will show in "This Month" and "All Time", but not "This Week")
  %{
    club_id: zonke_club.id,
    user_id: prince.id,
    amount: Decimal.new("8000.00"),
    visit_date: Date.add(today, -20),
    notes: "Good night 20 days ago"
  },

  # 10 days ago (will show in "This Month" and "All Time", but not "This Week")
  %{
    club_id: zonke_club.id,
    user_id: toni.id,
    amount: Decimal.new("7000.00"),
    visit_date: Date.add(today, -10),
    notes: "Nice night 10 days ago"
  }
]

IO.puts("Creating test spending records with different dates...")

Enum.each(records_to_create, fn attrs ->
  case Backend.Spending.SpendingRecords.create_spending_record(attrs) do
    {:ok, record} ->
      IO.puts("✓ Created: #{attrs.visit_date} - R#{attrs.amount}")
    {:error, changeset} ->
      IO.puts("✗ Failed to create record for #{attrs.visit_date}")
      IO.inspect(changeset.errors)
  end
end)

IO.puts("\n=== Testing Leaderboards ===\n")

# Test all time periods
[:all, :month, :week]
|> Enum.each(fn period ->
  leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: period, limit: 10)

  IO.puts("#{String.upcase(to_string(period))} (#{length(leaderboard)} users):")
  Enum.each(leaderboard, fn entry ->
    IO.puts("  #{entry.username}: R#{entry.amount} on #{entry.visit_date}")
  end)
  IO.puts("")
end)

IO.puts("✓ Test data created! Now refresh your admin panel and try the time period filters.")
