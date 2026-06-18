# Quick script to check if there's data in the database
import Ecto.Query
alias Backend.Repo

# Check for clubs
clubs_count = Repo.aggregate(Backend.Clubs.Club, :count)
IO.puts("📌 Total clubs: #{clubs_count}")

# Check for posts
posts_count = Repo.aggregate(Backend.Posts.Post, :count)
IO.puts("📝 Total posts: #{posts_count}")

# Check for club likes
club_likes_count = Repo.aggregate(Backend.Clubs.ClubLike, :count)
IO.puts("❤️  Total club favorites: #{club_likes_count}")

# Check for events
events_count = Repo.aggregate(Backend.Admin.Event, :count)
IO.puts("📅 Total events: #{events_count}")

# Check for post likes
post_likes_count = Repo.aggregate(Backend.Posts.PostLike, :count)
IO.puts("👍 Total post likes: #{post_likes_count}")
