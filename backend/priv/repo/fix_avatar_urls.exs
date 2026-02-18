alias Backend.Repo
alias Backend.Accounts.User
alias Backend.Intentions.Intention

IO.puts("Checking users with LocalStack S3 avatar URLs...")

# Find all users with avatar URLs pointing to LocalStack
users = Repo.all(User)

users_with_s3_avatars =
  Enum.filter(users, fn user ->
    user.avatar_url && String.contains?(user.avatar_url, "4566/zonke-clubs-bucket")
  end)

IO.puts("Found #{length(users_with_s3_avatars)} users with LocalStack S3 avatars")

if length(users_with_s3_avatars) > 0 do
  IO.puts("\nUpdating avatar URLs to accessible placeholders...\n")

  # Use publicly accessible placeholder images
  placeholder_images = [
    "https://api.dicebear.com/7.x/avataaars/png?seed=Sarah&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Mike&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Emma&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/avataaars/png?seed=James&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Lisa&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Alex&backgroundColor=ffd6e8",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Jordan&backgroundColor=c5e4f3",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Sam&backgroundColor=ffebcc",
  ]

  users_with_s3_avatars
  |> Enum.with_index()
  |> Enum.each(fn {user, index} ->
    # Use first_name to generate a unique avatar
    new_avatar_url = "https://api.dicebear.com/7.x/avataaars/png?seed=#{user.first_name}&backgroundColor=#{Enum.random(["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "ffd6e8", "c5e4f3", "ffebcc"])}"

    case user
         |> User.profile_changeset(%{avatar_url: new_avatar_url})
         |> Repo.update() do
      {:ok, updated_user} ->
        IO.puts("  ✓ Updated #{updated_user.first_name} #{updated_user.last_name}")

      {:error, changeset} ->
        IO.puts("  ✗ Failed to update #{user.first_name}: #{inspect(changeset.errors)}")
    end
  end)

  IO.puts("\n✅ Avatar URLs updated!")
  IO.puts("\nAlternatively, you can set avatar_url to NULL to show initials:")
  IO.puts("Run: Repo.update_all(User, set: [avatar_url: nil])")
else
  IO.puts("No users with LocalStack S3 avatars found.")
end

# Show current intentions with user avatars
IO.puts("\n--- Current Intentions ---")
intentions = Repo.all(Intention) |> Repo.preload(:user) |> Enum.take(5)

Enum.each(intentions, fn i ->
  IO.puts("#{i.user.first_name} - Avatar: #{i.user.avatar_url}")
end)
