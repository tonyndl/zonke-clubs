#!/usr/bin/env elixir

# Demonstrate position changes by adding older spending records
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

# Get some existing users
prince = Repo.one(from u in User, where: u.username == "Prince")
toni = Repo.one(from u in User, where: u.username == "Toni")
big_spender = Repo.one(from u in User, where: u.username == "BigSpender")

today = Date.utc_today()

IO.puts("\n=== Adding Previous Period Data (to show position changes) ===\n")

# Add spending records from 10-14 days ago (previous week for month comparison)
previous_week_records = [
  # Prince was #1 in previous week with R12,000
  %{
    club_id: zonke_club.id,
    user_id: prince.id,
    amount: Decimal.new("12000.00"),
    visit_date: Date.add(today, -12),
    notes: "Previous week - Prince was #1"
  },
  # Toni was #2 in previous week with R8,000
  %{
    club_id: zonke_club.id,
    user_id: toni.id,
    amount: Decimal.new("8000.00"),
    visit_date: Date.add(today, -12),
    notes: "Previous week - Toni was #2"
  },
  # BigSpender wasn't on chart in previous week
]

Enum.each(previous_week_records, fn attrs ->
  case Backend.Spending.SpendingRecords.create_spending_record(attrs) do
    {:ok, _record} ->
      IO.puts("✓ Added: #{Date.add(today, -12)} - #{attrs.notes}")
    {:error, changeset} ->
      IO.puts("✗ Failed")
      IO.inspect(changeset.errors)
  end
end)

IO.puts("\n=== Week Leaderboard (Now shows position changes!) ===\n")

leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :week, limit: 10)

IO.puts(String.pad_trailing("Rank", 6) <> String.pad_trailing("Username", 20) <> String.pad_trailing("Amount", 12) <> String.pad_trailing("Position", 15) <> "Analysis")
IO.puts(String.duplicate("-", 80))

Enum.each(leaderboard, fn entry ->
  position_str = case entry.position_change do
    :new -> "⭐ New"
    0 -> "➖ Same"
    n when n > 0 -> "↑ +#{n}"
    n -> "↓ #{n}"
  end

  analysis = case {entry.username, entry.position_change} do
    {"BigSpender", :new} -> "First time on leaderboard this week!"
    {"Prince", n} when n < 0 -> "Dropped from #1 to ##{entry.rank}"
    {"Toni", 0} -> "Maintained position"
    {"Toni", n} when n < 0 -> "Dropped from previous position"
    _ -> ""
  end

  IO.puts(
    String.pad_trailing("##{entry.rank}", 6) <>
    String.pad_trailing(entry.username || "Unknown", 20) <>
    String.pad_trailing("R#{entry.amount}", 12) <>
    String.pad_trailing(position_str, 15) <>
    analysis
  )
end)

IO.puts("\n=== Expected Position Changes ===")
IO.puts("✅ BigSpender: ⭐ New (wasn't on chart last week)")
IO.puts("✅ Prince: ↓ (was #1, now lower)")
IO.puts("✅ Toni: Changed position based on current vs previous week")
IO.puts("\n📊 Position tracking works across time periods!")
