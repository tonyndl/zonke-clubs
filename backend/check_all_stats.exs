# Comprehensive dashboard stats check
import Ecto.Query
alias Backend.Repo

IO.puts("\n═══ DASHBOARD STATISTICS CHECK ═══\n")

# 1. Check Clubs
IO.puts("1️⃣  CLUBS")
clubs = Repo.all(Backend.Clubs.Club)
IO.puts("   Total clubs: #{length(clubs)}")
if length(clubs) > 0 do
  Enum.each(clubs, fn club ->
    IO.puts("   - #{club.name} (ID: #{club.id})")
    IO.puts("     Admin ID: #{club.admin_id || "none (user club)"}")
  end)
end

# 2. Check Club Favorites
IO.puts("\n2️⃣  CLUB FAVORITES")
club_likes = Repo.all(Backend.Clubs.ClubLike)
IO.puts("   Total club favorites: #{length(club_likes)}")
if length(clubs) > 0 do
  Enum.each(clubs, fn club ->
    count = Repo.aggregate(
      from(cl in Backend.Clubs.ClubLike, where: cl.club_id == ^club.id),
      :count
    )
    IO.puts("   - #{club.name}: #{count} favorites")
  end)
end

# 3. Check Events
IO.puts("\n3️⃣  EVENTS")
all_events = Repo.all(Backend.Admin.Event)
IO.puts("   Total events: #{length(all_events)}")

today = Date.utc_today()
upcoming_published = Repo.aggregate(
  from(e in Backend.Admin.Event, 
    where: e.status == "published" and e.date >= ^today),
  :count
)
IO.puts("   Upcoming published events: #{upcoming_published}")

if length(all_events) > 0 do
  Enum.each(all_events, fn event ->
    is_upcoming = Date.compare(event.date, today) != :lt
    IO.puts("   - #{event.title}")
    IO.puts("     Date: #{event.date} (#{if is_upcoming, do: "upcoming", else: "past"})")
    IO.puts("     Status: #{event.status}")
    IO.puts("     Admin ID: #{event.admin_id}")
  end)
end

# 4. Check Posts
IO.puts("\n4️⃣  POSTS")
all_posts = Repo.all(Backend.Posts.Post)
IO.puts("   Total posts: #{length(all_posts)}")

# Posts with assets
posts_with_assets = Repo.aggregate(
  from(p in Backend.Posts.Post,
    where: exists(
      from a in Backend.Assets.Asset,
        where: a.post_id == p.id
    )
  ),
  :count
)
IO.puts("   Posts with assets: #{posts_with_assets}")

# Pending posts (within 24 hours)
cutoff_time = NaiveDateTime.add(NaiveDateTime.utc_now(), -24 * 60 * 60, :second)
pending_posts = Repo.aggregate(
  from(p in Backend.Posts.Post,
    where: p.status == "pending" and p.inserted_at >= ^cutoff_time and
      exists(
        from a in Backend.Assets.Asset,
          where: a.post_id == p.id
      )
  ),
  :count
)
IO.puts("   Pending posts (last 24h): #{pending_posts}")

# 5. Check Admins
IO.puts("\n5️⃣  ADMINS")
admins = Repo.all(Backend.Admin.Admin)
IO.puts("   Total admins: #{length(admins)}")
if length(admins) > 0 do
  Enum.each(admins, fn admin ->
    IO.puts("   - #{admin.name || admin.email}")
    IO.puts("     ID: #{admin.id}")
    IO.puts("     Email: #{admin.email}")
    
    # Find club for this admin
    club = Repo.get_by(Backend.Clubs.Club, admin_id: admin.id)
    if club do
      IO.puts("     Club: #{club.name}")
      
      # Stats for this admin's club
      favorites = Repo.aggregate(
        from(cl in Backend.Clubs.ClubLike, where: cl.club_id == ^club.id),
        :count
      )
      
      events = Repo.aggregate(
        from(e in Backend.Admin.Event, 
          where: e.admin_id == ^admin.id and e.status == "published" and e.date >= ^today),
        :count
      )
      
      posts = Repo.aggregate(
        from(p in Backend.Posts.Post,
          where: p.club_id == ^club.id and
            exists(from a in Backend.Assets.Asset, where: a.post_id == p.id)
        ),
        :count
      )
      
      IO.puts("     📊 Stats:")
      IO.puts("        Club favorites: #{favorites}")
      IO.puts("        Upcoming events: #{events}")
      IO.puts("        Total posts: #{posts}")
    else
      IO.puts("     ⚠️  No club associated")
    end
  end)
end

IO.puts("\n═══════════════════════════════════\n")
