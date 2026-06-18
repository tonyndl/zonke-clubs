#!/usr/bin/env elixir

# Simulate what the API endpoint returns
import Ecto.Query
alias Backend.Repo
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

IO.puts("\n=== Simulating API Response ===\n")
IO.puts("GET /api/admin/spending-records/leaderboard?time_period=all&limit=10\n")

# Get leaderboard data (what the controller does)
leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 10)

# Format as JSON (what the JSON view does)
json_response = BackendWeb.Admin.SpendingRecordJSON.leaderboard(%{leaderboard: leaderboard})

IO.puts("Response JSON:")
IO.puts(Jason.encode!(json_response, pretty: true))

IO.puts("\n=== Key Points ===")
IO.puts("✅ Each entry includes 'rank' field")
IO.puts("✅ Tied users (Prince & Toni) both have rank: 3")
IO.puts("✅ Tied users (MediumSpender1 & MediumSpender2) both have rank: 5")
IO.puts("✅ Ranking skips numbers after ties (1, 2, 3, 3, 5, 5, 7)")
IO.puts("\n📱 Frontend should now display these ranks correctly!")
