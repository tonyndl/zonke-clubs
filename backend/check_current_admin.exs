#!/usr/bin/env elixir

# Check stats for the specific admin that's logged into the web app
# Run with: mix run check_current_admin.exs

alias Backend.Repo
alias Backend.Admin.{Admin, Event}
alias Backend.Clubs.{Club, ClubLike}
alias Backend.Posts.Post
import Ecto.Query

# This is the admin ID from the web app logs
admin_id = "a0877779-c3a6-4de5-a8e4-bd7d6ede29d6"

IO.puts("\n🔍 Checking stats for logged-in admin: #{admin_id}\n")
IO.puts("=" |> String.duplicate(80))

# Get the admin
admin = Repo.get(Admin, admin_id)

if is_nil(admin) do
  IO.puts("❌ Admin not found")
  System.halt(1)
end

IO.puts("\n✅ Admin: #{admin.name} (#{admin.email})")

# Get the club
club = Repo.get_by(Club, admin_id: admin.id)

if is_nil(club) do
  IO.puts("❌ No club found for this admin")
  System.halt(1)
end

IO.puts("✅ Club: #{club.name}")
IO.puts("   Club ID: #{club.id}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📊 CLUB FAVORITES")
IO.puts("=" |> String.duplicate(80))

# Check club_likes for this club
club_likes = Repo.all(from cl in ClubLike, where: cl.club_id == ^club.id)
IO.puts("\n   Total club_likes: #{length(club_likes)}")

if length(club_likes) > 0 do
  IO.puts("\n   Users who favorited this club:")
  Enum.each(club_likes, fn like ->
    user = Repo.get(Backend.Accounts.User, like.user_id)
    username = if user do
      cond do
        user.first_name && user.last_name -> "#{user.first_name} #{user.last_name}"
        user.username -> user.username
        user.email -> user.email
        true -> "Unknown"
      end
    else
      "Unknown"
    end
    IO.puts("   - #{username}")
  end)
end

# Use the actual function
favorites_count = Backend.Clubs.get_club_favorites_count(club.id)
IO.puts("\n✅ get_club_favorites_count() = #{favorites_count}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📅 EVENTS")
IO.puts("=" |> String.duplicate(80))

# Check all events for this admin
all_events = Repo.all(from e in Event, where: e.admin_id == ^admin.id)
IO.puts("\n   Total events: #{length(all_events)}")

today = Date.utc_today()
IO.puts("   Today: #{today}")

if length(all_events) > 0 do
  IO.puts("\n   Events for this admin:")
  Enum.each(all_events, fn event ->
    is_future = Date.compare(event.date, today) != :lt
    status_icon = if event.status == "published", do: "✅", else: "❌"
    date_icon = if is_future, do: "📅", else: "⏰"

    IO.puts("\n   #{event.title}")
    IO.puts("      Status: #{status_icon} #{event.status}")
    IO.puts("      Date: #{date_icon} #{event.date} #{if is_future, do: "(future)", else: "(past)"}")
  end)
end

# Check upcoming published events
upcoming = Repo.all(
  from e in Event,
    where: e.admin_id == ^admin.id and e.status == "published" and e.date >= ^today
)
IO.puts("\n   Upcoming published events: #{length(upcoming)}")

# Use the actual function
upcoming_count = Backend.Admin.Events.count_upcoming_events(admin)
IO.puts("\n✅ count_upcoming_events() = #{upcoming_count}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📋 FINAL DASHBOARD STATS")
IO.puts("=" |> String.duplicate(80))

# Get the exact stats that the controller returns
post_stats = Backend.Posts.get_dashboard_stats(club.id)

stats = Map.merge(post_stats, %{
  club_favorites: favorites_count,
  upcoming_events: upcoming_count
})

IO.puts("\n✅ Stats that should appear on dashboard:")
IO.inspect(stats, label: "   ", pretty: true)

IO.puts("\n" <> ("=" |> String.duplicate(80)))
