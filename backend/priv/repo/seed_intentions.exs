alias Backend.Repo
alias Backend.Accounts.User
alias Backend.Intentions.Intention

# Club ID (The Grand Africa Café & Beach)
club_id = "3f1b5bd3-a899-44c1-bfda-ee83f940accb"

# Create test users with avatar URLs
users_data = [
  %{
    first_name: "Sarah",
    last_name: "Johnson",
    username: "sarah_j_#{:rand.uniform(10000)}",
    role: "club_goer",
    avatar_url: "https://i.pravatar.cc/300?img=47",
    bio: "Love dancing and meeting new people!",
    onboarding_complete: true
  },
  %{
    first_name: "Mike",
    last_name: "Anderson",
    username: "mike_a_#{:rand.uniform(10000)}",
    role: "club_goer",
    avatar_url: "https://i.pravatar.cc/300?img=12",
    bio: "Always up for a good time at the clubs",
    onboarding_complete: true
  },
  %{
    first_name: "Emma",
    last_name: "Davis",
    username: "emma_d_#{:rand.uniform(10000)}",
    role: "club_goer",
    avatar_url: "https://i.pravatar.cc/300?img=5",
    bio: "Music lover and social butterfly",
    onboarding_complete: true
  },
  %{
    first_name: "James",
    last_name: "Wilson",
    username: "james_w_#{:rand.uniform(10000)}",
    role: "club_goer",
    avatar_url: "https://i.pravatar.cc/300?img=33",
    bio: "Looking to make new friends",
    onboarding_complete: true
  },
  %{
    first_name: "Lisa",
    last_name: "Martinez",
    username: "lisa_m_#{:rand.uniform(10000)}",
    role: "club_goer",
    avatar_url: "https://i.pravatar.cc/300?img=20",
    bio: "Party enthusiast and cocktail connoisseur",
    onboarding_complete: true
  }
]

IO.puts("Creating test users with avatar URLs...")

users =
  Enum.map(users_data, fn user_data ->
    case User.registration_changeset(Map.put(user_data, :password, "password123"))
         |> Repo.insert() do
      {:ok, user} ->
        IO.puts("  ✓ Created user: #{user.first_name} #{user.last_name}")
        user

      {:error, changeset} ->
        # If username already exists, try to find existing user
        case Repo.get_by(User, username: user_data.username) do
          nil ->
            IO.puts("  ✗ Failed to create user: #{inspect(changeset.errors)}")
            nil

          existing_user ->
            IO.puts("  ↻ Found existing user: #{existing_user.first_name}")
            existing_user
        end
    end
  end)
  |> Enum.filter(&(&1 != nil))

IO.puts("\nCreating intentions for test users...")

# Get today and tomorrow dates
today = Date.utc_today()
tomorrow = Date.add(today, 1)

intentions_data = [
  %{
    activity_type: "dancing_partner",
    planned_date: today,
    message: "Looking for someone to hit the dance floor with tonight! 💃",
    active: true
  },
  %{
    activity_type: "drinking_buddy",
    planned_date: today,
    message: "Who wants to grab some cocktails and have fun?",
    active: true
  },
  %{
    activity_type: "new_friends",
    planned_date: tomorrow,
    message: "New to the area, would love to make some friends!",
    active: true
  },
  %{
    activity_type: "open_to_anything",
    planned_date: today,
    message: "Open to meeting new people and having a great time",
    active: true
  },
  %{
    activity_type: "dancing_partner",
    planned_date: tomorrow,
    message: "Let's dance the night away! Looking for a fun partner",
    active: true
  }
]

Enum.zip(users, intentions_data)
|> Enum.each(fn {user, intention_data} ->
  intention_attrs =
    intention_data
    |> Map.put(:user_id, user.id)
    |> Map.put(:club_id, club_id)

  case %Intention{}
       |> Intention.changeset(intention_attrs)
       |> Repo.insert() do
    {:ok, intention} ->
      IO.puts("  ✓ Created #{intention.activity_type} intention for #{user.first_name}")

    {:error, changeset} ->
      IO.puts("  ✗ Failed to create intention: #{inspect(changeset.errors)}")
  end
end)

IO.puts("\n✅ Seed completed!")
IO.puts("\nYou can now view these intentions in the app at club:")
IO.puts("The Grand Africa Café & Beach (#{club_id})")
