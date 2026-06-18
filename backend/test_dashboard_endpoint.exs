#!/usr/bin/env elixir

# Test the dashboard stats endpoint
# Run with: mix run test_dashboard_endpoint.exs

alias Backend.Repo
alias Backend.Admin.Admin
alias Backend.Clubs
alias Backend.Posts
alias Backend.Admin.Events
import Ecto.Query

IO.puts("\n🧪 Testing Dashboard Stats Endpoint Logic\n")
IO.puts("=" |> String.duplicate(80))

# Get the first admin
admin = Repo.one(from a in Admin, limit: 1)

if is_nil(admin) do
  IO.puts("❌ No admin found")
  System.halt(1)
end

IO.puts("✅ Admin: #{admin.name} (#{admin.email})")

# This mimics what the controller does
case Clubs.get_admin_club(admin.id) do
  {:ok, club} ->
    IO.puts("✅ Club: #{club.name}")

    # Get post statistics
    post_stats = Posts.get_dashboard_stats(club.id)
    IO.puts("\n📊 Post Stats:")
    IO.inspect(post_stats, label: "   ")

    # Get club favorites count
    favorites_count = Clubs.get_club_favorites_count(club.id)
    IO.puts("\n❤️  Club Favorites: #{favorites_count}")

    # Get upcoming events count
    upcoming_events_count = Events.count_upcoming_events(admin)
    IO.puts("📅 Upcoming Events: #{upcoming_events_count}")

    # Build the response (same as controller)
    stats = Map.merge(post_stats, %{
      club_favorites: favorites_count,
      upcoming_events: upcoming_events_count
    })

    IO.puts("\n✅ Final Response (what controller returns):")
    IO.inspect(stats, label: "   ", pretty: true)

  {:error, :not_found} ->
    IO.puts("❌ No club found for admin")
end

IO.puts("\n" <> ("=" |> String.duplicate(80)))
