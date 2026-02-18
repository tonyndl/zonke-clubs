#!/usr/bin/env elixir

# Debug script to check dashboard stats
# Run with: mix run debug_dashboard_stats.exs

alias Backend.Repo
alias Backend.Admin.Admin
alias Backend.Clubs.{Club, ClubLike}
alias Backend.Admin.Event
import Ecto.Query

IO.puts("\n🔍 DEBUG: Dashboard Stats\n")
IO.puts("=" |> String.duplicate(80))

# Get the first admin (assuming that's you)
admin = Repo.one(from a in Admin, limit: 1)

if is_nil(admin) do
  IO.puts("❌ No admin found in database")
  System.halt(1)
end

IO.puts("\n✅ Admin found:")
IO.puts("   ID: #{admin.id}")
IO.puts("   Email: #{admin.email}")
IO.puts("   Name: #{admin.name}")

# Get the admin's club
club = Repo.get_by(Club, admin_id: admin.id)

if is_nil(club) do
  IO.puts("\n❌ No club found for this admin")
  System.halt(1)
end

IO.puts("\n✅ Club found:")
IO.puts("   ID: #{club.id}")
IO.puts("   Name: #{club.name}")
IO.puts("   Admin ID: #{club.admin_id}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📊 CHECKING CLUB FAVORITES (ClubLike table)")
IO.puts("=" |> String.duplicate(80))

# Check all club_likes
all_club_likes = Repo.all(ClubLike)
IO.puts("\n📌 Total club_likes in database: #{length(all_club_likes)}")

if length(all_club_likes) > 0 do
  IO.puts("\n   All club_likes records:")
  Enum.each(all_club_likes, fn like ->
    IO.puts("   - User ID: #{like.user_id}, Club ID: #{like.club_id}")
  end)
end

# Check club_likes for this specific club
club_likes_for_club = Repo.all(from cl in ClubLike, where: cl.club_id == ^club.id)
IO.puts("\n📌 Club_likes for club '#{club.name}' (ID: #{club.id}): #{length(club_likes_for_club)}")

if length(club_likes_for_club) > 0 do
  IO.puts("   Details:")
  Enum.each(club_likes_for_club, fn like ->
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
    IO.puts("   - #{username} (User ID: #{like.user_id})")
  end)
end

# Run the actual function used in the controller
favorites_count = Backend.Clubs.get_club_favorites_count(club.id)
IO.puts("\n✅ Backend.Clubs.get_club_favorites_count(#{club.id}) = #{favorites_count}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📅 CHECKING EVENTS")
IO.puts("=" |> String.duplicate(80))

# Check all events
all_events = Repo.all(Event)
IO.puts("\n📌 Total events in database: #{length(all_events)}")

if length(all_events) > 0 do
  today = Date.utc_today()
  IO.puts("\n   Today's date: #{today}")
  IO.puts("\n   All events:")

  Enum.each(all_events, fn event ->
    is_future = Date.compare(event.date, today) != :lt
    status_icon = if event.status == "published", do: "✅", else: "❌"
    date_icon = if is_future, do: "📅", else: "⏰"

    IO.puts("\n   Event: #{event.title}")
    IO.puts("      - ID: #{event.id}")
    IO.puts("      - Admin ID: #{event.admin_id}")
    IO.puts("      - Status: #{status_icon} #{event.status}")
    IO.puts("      - Date: #{date_icon} #{event.date} #{if is_future, do: "(future)", else: "(past)"}")
    IO.puts("      - Time: #{event.start_time || "N/A"} - #{event.end_time || "N/A"}")
  end)
end

# Check events for this admin
admin_events = Repo.all(from e in Event, where: e.admin_id == ^admin.id)
IO.puts("\n📌 Events for admin '#{admin.name}' (ID: #{admin.id}): #{length(admin_events)}")

# Check upcoming published events
today = Date.utc_today()
upcoming_published = Repo.all(
  from e in Event,
    where: e.admin_id == ^admin.id and e.status == "published" and e.date >= ^today
)
IO.puts("\n📌 Upcoming published events: #{length(upcoming_published)}")

if length(upcoming_published) > 0 do
  IO.puts("   Details:")
  Enum.each(upcoming_published, fn event ->
    IO.puts("   - #{event.title} on #{event.date}")
  end)
end

# Run the actual function used in the controller
upcoming_count = Backend.Admin.Events.count_upcoming_events(admin)
IO.puts("\n✅ Backend.Admin.Events.count_upcoming_events(admin) = #{upcoming_count}")

IO.puts("\n" <> ("=" |> String.duplicate(80)))
IO.puts("📋 SUMMARY")
IO.puts("=" |> String.duplicate(80))
IO.puts("\n   Admin: #{admin.name}")
IO.puts("   Club: #{club.name}")
IO.puts("   Club Favorites: #{favorites_count}")
IO.puts("   Upcoming Events: #{upcoming_count}")
IO.puts("\n" <> ("=" |> String.duplicate(80)))
