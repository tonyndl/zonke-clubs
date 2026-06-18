#!/usr/bin/env elixir

import Ecto.Query
alias Backend.Repo
alias Backend.Spending.SpendingRecord
alias Backend.Accounts.User

test_usernames = ["BigSpender", "MediumSpender1", "MediumSpender2", "SmallSpender", "OldSpender"]

IO.puts("\n=== Removing Test Users ===\n")

Enum.each(test_usernames, fn username ->
  case Repo.one(from u in User, where: u.username == ^username) do
    nil ->
      IO.puts("⚠️  #{username} not found, skipping")

    user ->
      # Delete all spending records for this user
      {record_count, _} = Repo.delete_all(from s in SpendingRecord, where: s.user_id == ^user.id)
      # Delete the user
      Repo.delete!(user)
      IO.puts("✅ Removed #{username} (#{record_count} spending records deleted)")
  end
end)

IO.puts("\n=== Done ===")
