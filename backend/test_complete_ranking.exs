#!/usr/bin/env elixir

# Add more test data to demonstrate full ranking with ties
import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User
alias Backend.Clubs.Club

# Get ZONKE club
zonke_club = Repo.one!(from c in Club, where: c.name == "ZONKE")

# Get existing users
existing_users = Repo.all(from u in User, select: %{id: u.id, username: u.username})
IO.puts("\n=== Existing Users ===")
Enum.each(existing_users, fn u -> IO.puts("  - #{u.username} (#{String.slice(u.id, 0..7)}...)") end)

# Create some additional test users with varying spend amounts
IO.puts("\n=== Creating Additional Test Users ===")

test_users = [
  %{username: "BigSpender", password: "password123", role: "club_goer", amount: "12000.00"},
  %{username: "MediumSpender1", password: "password123", role: "club_goer", amount: "8000.00"},
  %{username: "MediumSpender2", password: "password123", role: "club_goer", amount: "8000.00"},
  %{username: "SmallSpender", password: "password123", role: "club_goer", amount: "5000.00"}
]

created_users =
  Enum.map(test_users, fn user_attrs ->
    case Backend.Accounts.Registration.register_user(%{
      "username" => user_attrs.username,
      "password" => user_attrs.password,
      "role" => user_attrs.role
    }) do
      {:ok, user} ->
        IO.puts("  ✓ Created: #{user.username}")
        {user, user_attrs.amount}

      {:error, changeset} ->
        # User might already exist, fetch them
        case Repo.one(from u in User, where: u.username == ^user_attrs.username) do
          nil ->
            IO.puts("  ✗ Failed to create #{user_attrs.username}")
            IO.inspect(changeset.errors)
            nil

          existing ->
            IO.puts("  ✓ Using existing: #{existing.username}")
            {existing, user_attrs.amount}
        end
    end
  end)
  |> Enum.filter(&(&1 != nil))

# Add spending records for new users
IO.puts("\n=== Adding Spending Records ===")
today = Date.utc_today()

Enum.each(created_users, fn {user, amount} ->
  attrs = %{
    club_id: zonke_club.id,
    user_id: user.id,
    amount: Decimal.new(amount),
    visit_date: Date.add(today, -5),
    notes: "Test spend for #{user.username}"
  }

  case Backend.Spending.SpendingRecords.create_spending_record(attrs) do
    {:ok, _record} ->
      IO.puts("  ✓ Added R#{amount} for #{user.username}")

    {:error, _changeset} ->
      IO.puts("  ✗ Failed to add record for #{user.username}")
  end
end)

# Now test the leaderboard
IO.puts("\n=== COMPLETE LEADERBOARD (All Time) ===\n")

leaderboard = Backend.Spending.SpendingRecords.get_leaderboard(zonke_club.id, time_period: :all, limit: 10)

Enum.each(leaderboard, fn entry ->
  IO.puts("  ##{entry.rank} - #{String.pad_trailing(entry.username, 20)} R#{entry.amount}")
end)

IO.puts("\n=== Expected Ranking ===")
IO.puts("  #1  - OldSpender          R15,000")
IO.puts("  #2  - BigSpender          R12,000")
IO.puts("  #3  - Prince              R10,000  (tied)")
IO.puts("  #3  - Toni                R10,000  (tied)")
IO.puts("  #5  - MediumSpender1      R8,000   (tied)")
IO.puts("  #5  - MediumSpender2      R8,000   (tied)")
IO.puts("  #7  - SmallSpender        R5,000")

IO.puts("\n✅ Notice how tied users get the same rank (#3, #3 then #5, #5)")
IO.puts("   The next rank after a tie skips numbers (standard competition ranking)")
