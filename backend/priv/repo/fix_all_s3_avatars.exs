alias Backend.Repo
alias Backend.Accounts.User

IO.puts("Finding all users with LocalStack S3 avatar URLs...")

# Find all users with LocalStack S3 URLs
users = Repo.all(User)

users_needing_fix =
  Enum.filter(users, fn user ->
    user.avatar_url &&
      (String.contains?(user.avatar_url, "4566/zonke-clubs-bucket") ||
         String.contains?(user.avatar_url, ":4566/"))
  end)

IO.puts("Found #{length(users_needing_fix)} users with direct LocalStack URLs\n")

# List all files in LocalStack S3 bucket
bucket = "zonke-clubs-bucket"

case ExAws.S3.list_objects(bucket) |> ExAws.request() do
  {:ok, %{body: %{contents: contents}}} ->
    avatar_files =
      contents
      |> Enum.filter(fn obj -> String.contains?(obj.key, "avatar") end)
      |> Enum.map(& &1.key)

    IO.puts("Found #{length(avatar_files)} avatar files in S3:")
    Enum.each(avatar_files, fn file -> IO.puts("  - #{file}") end)

    # Update users with LocalStack URLs to use proxy
    Enum.each(users_needing_fix, fn user ->
      # Extract filename from LocalStack URL
      filename =
        user.avatar_url
        |> String.split("/")
        |> List.last()
        |> String.split("?")
        |> List.first()

      # Check if file exists in S3
      if filename in avatar_files do
        proxy_url = "http://192.168.1.139:4000/api/avatars/#{filename}"
        IO.puts("\nUpdating #{user.first_name} #{user.last_name}")
        IO.puts("  From: #{user.avatar_url}")
        IO.puts("  To:   #{proxy_url}")

        case user
             |> User.profile_changeset(%{avatar_url: proxy_url})
             |> Repo.update() do
          {:ok, _updated} ->
            IO.puts("  ✓ Updated")

          {:error, changeset} ->
            IO.puts("  ✗ Failed: #{inspect(changeset.errors)}")
        end
      else
        IO.puts("\n✗ File not found for #{user.first_name}: #{filename}")
      end
    end)

  {:error, reason} ->
    IO.puts("Error listing S3 objects: #{inspect(reason)}")
end

IO.puts("\n✅ Done!")
