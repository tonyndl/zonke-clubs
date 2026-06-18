#!/usr/bin/env elixir

# Test ranking logic with tied amounts
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Testing Leaderboard Ranking with Ties ===\n")

# Test all time
leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 10)

IO.puts("ALL TIME LEADERBOARD (#{length(leaderboard)} users):\n")
Enum.each(leaderboard, fn entry ->
  IO.puts("  ##{entry.rank} - #{entry.username}: R#{entry.amount} (#{entry.visit_date})")
end)

# Check for ties
amounts = Enum.map(leaderboard, & &1.amount)
ranks = Enum.map(leaderboard, & &1.rank)

IO.puts("\n=== Tie Analysis ===")
IO.puts("Amounts: #{inspect(amounts)}")
IO.puts("Ranks: #{inspect(ranks)}")

# Group by amount to find ties
tied_groups =
  leaderboard
  |> Enum.group_by(& &1.amount)
  |> Enum.filter(fn {_amount, entries} -> length(entries) > 1 end)

if length(tied_groups) > 0 do
  IO.puts("\n✅ TIES FOUND:")
  Enum.each(tied_groups, fn {amount, entries} ->
    usernames = Enum.map(entries, & &1.username)
    rank = hd(entries).rank
    IO.puts("  Rank ##{rank}: #{Enum.join(usernames, ", ")} - R#{amount}")
  end)
else
  IO.puts("\n⚠️  NO TIES FOUND in current data")
end

# Verify ranking sequence
IO.puts("\n=== Ranking Sequence Verification ===")
expected_sequence_correct =
  leaderboard
  |> Enum.with_index(1)
  |> Enum.all?(fn {entry, index} ->
    # Rank should be >= index (can skip numbers due to ties)
    entry.rank >= index
  end)

if expected_sequence_correct do
  IO.puts("✅ Ranking sequence is valid (ranks can skip due to ties)")
else
  IO.puts("❌ Ranking sequence has errors!")
end

IO.puts("\n=== Example with Current Data ===")
IO.puts("If Prince (R10,000) and Toni (R10,000) are tied:")
IO.puts("  Expected: #2 Prince, #2 Toni, #4 [next person]")
IO.puts("  Actual: #{Enum.map_join(leaderboard, ", ", fn e -> "##{e.rank} #{e.username}" end)}")
