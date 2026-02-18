alias Backend.Repo
alias Backend.Accounts.User

IO.puts("Finding Prince Ndlovu...")

case Repo.get_by(User, first_name: "Prince", last_name: "Ndlovu") do
  nil ->
    IO.puts("Prince Ndlovu not found!")

  prince ->
    IO.puts("Found Prince: #{prince.id}")
    IO.puts("Current avatar URL: #{prince.avatar_url}")

    # The LocalStack S3 filename
    s3_filename = "avatar_1771025353843_1770989333819_QSTngOXK.jpg"

    # Use the backend proxy endpoint instead of direct LocalStack URL
    # This makes it accessible from mobile devices
    proxy_url = "http://192.168.1.139:4000/api/avatars/#{s3_filename}"

    IO.puts("\nUpdating to proxy URL: #{proxy_url}")

    case prince
         |> User.profile_changeset(%{avatar_url: proxy_url})
         |> Repo.update() do
      {:ok, updated_user} ->
        IO.puts("✓ Successfully updated Prince's avatar URL")
        IO.puts("  New URL: #{updated_user.avatar_url}")

      {:error, changeset} ->
        IO.puts("✗ Failed to update: #{inspect(changeset.errors)}")
    end
end
