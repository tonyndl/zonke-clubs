#!/usr/bin/env elixir

# Test that the leaderboard JSON includes rank field
import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Testing Leaderboard JSON Output ===\n")

# Get leaderboard data
leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 10)

# Format as JSON (simulating what the controller would do)
# Call the public leaderboard/1 function which internally uses leaderboard_data/1
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: leaderboard})
json_output = json_response.leaderboard

IO.puts("Leaderboard JSON output:\n")
IO.inspect(json_output, pretty: true, limit: :infinity)

IO.puts("\n=== Verification ===")
if Enum.all?(json_output, &Map.has_key?(&1, :rank)) do
  IO.puts("✅ All entries have the 'rank' field!")

  # Check for ties
  tied_ranks =
    json_output
    |> Enum.group_by(& &1.rank)
    |> Enum.filter(fn {_rank, entries} -> length(entries) > 1 end)

  if length(tied_ranks) > 0 do
    IO.puts("\n✅ TIES CORRECTLY RETURNED IN JSON:")
    Enum.each(tied_ranks, fn {rank, entries} ->
      usernames = Enum.map(entries, & &1.username)
      amount = hd(entries).amount
      IO.puts("  Rank ##{rank}: #{Enum.join(usernames, ", ")} - R#{amount}")
    end)
  else
    IO.puts("\n⚠️  No ties in current data")
  end
else
  IO.puts("❌ ERROR: Some entries are missing the 'rank' field!")
end
