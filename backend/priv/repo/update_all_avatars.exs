alias Backend.Repo
alias Backend.Accounts.User

IO.puts("Updating all users without valid avatar URLs...")

# Get all users
users = Repo.all(User)

users
|> Enum.each(fn user ->
  # Check if avatar is missing or points to LocalStack
  needs_update =
    is_nil(user.avatar_url) ||
      user.avatar_url == "" ||
      String.contains?(user.avatar_url || "", "4566/zonke-clubs-bucket") ||
      String.contains?(user.avatar_url || "", "pravatar")

  if needs_update do
    # Generate avatar using DiceBear API with user's first name as seed
    colors = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "ffd6e8", "c5e4f3", "ffebcc"]
    color = Enum.random(colors)
    new_avatar_url =
      "https://api.dicebear.com/7.x/avataaars/png?seed=#{user.first_name}&backgroundColor=#{color}"

    case user
         |> User.profile_changeset(%{avatar_url: new_avatar_url})
         |> Repo.update() do
      {:ok, _updated_user} ->
        IO.puts("  ✓ Updated #{user.first_name} #{user.last_name}")

      {:error, changeset} ->
        IO.puts("  ✗ Failed to update #{user.first_name}: #{inspect(changeset.errors)}")
    end
  else
    IO.puts("  ↻ #{user.first_name} already has valid avatar")
  end
end)

IO.puts("\n✅ All avatars updated!")
IO.puts("\nUsers now have DiceBear avatars (generated avatars that work on mobile)")
