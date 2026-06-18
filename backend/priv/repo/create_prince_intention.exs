alias Backend.Repo
alias Backend.Accounts.User
alias Backend.Intentions.Intention

IO.puts("Creating intention for Prince...")

case Repo.get_by(User, first_name: "Prince", last_name: "Ndlovu") do
  nil ->
    IO.puts("Prince not found!")

  prince ->
    IO.puts("Found Prince: #{prince.first_name} #{prince.last_name}")
    IO.puts("Avatar URL: #{prince.avatar_url}")

    # Create intention for tonight at The Grand Africa Café & Beach
    club_id = "3f1b5bd3-a899-44c1-bfda-ee83f940accb"
    today = Date.utc_today()

    intention_attrs = %{
      user_id: prince.id,
      club_id: club_id,
      activity_type: "new_friends",
      planned_date: today,
      message: "Looking to make new friends and have a great night! 🎉",
      active: true
    }

    case %Intention{}
         |> Intention.changeset(intention_attrs)
         |> Repo.insert() do
      {:ok, intention} ->
        IO.puts("\n✓ Created intention for Prince!")
        IO.puts("  Activity: #{intention.activity_type}")
        IO.puts("  Date: #{intention.planned_date}")
        IO.puts("  Message: #{intention.message}")

      {:error, changeset} ->
        IO.puts("\n✗ Failed to create intention: #{inspect(changeset.errors)}")
    end
end
