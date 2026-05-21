# # Script for populating the database. You can run it as:
# #
# #     mix run priv/repo/seeds.exs
# #
# # Inside the script, you can read and write to any of your
# # repositories directly:
# #
# #     Backend.Repo.insert!(%Backend.SomeSchema{})
# #
# # We recommend using the bang functions (`insert!`, `update!`
# # and so on) as they will fail if something goes wrong.

# import Ecto.Query

# alias Backend.Repo
# alias Backend.Accounts.User
# alias Backend.Clubs.Club
# alias Backend.Assets.Asset
# alias Backend.Messenger.{Thread, ThreadParticipant, Message}
# alias Backend.Posts.Post
# alias Backend.Intentions.Intention
# alias Backend.Connections.ConnectionRequest

# # Clear existing data (optional - comment out if you want to keep existing data)
# IO.puts("Clearing existing data...")
# Repo.delete_all(Post)
# Repo.delete_all(ConnectionRequest)
# Repo.delete_all(Intention)
# Repo.delete_all(Message)
# Repo.delete_all(ThreadParticipant)
# Repo.delete_all(Thread)
# Repo.delete_all(Asset)
# Repo.delete_all(Club)
# Repo.delete_all(User)

# # Create admin user for the clubs
# IO.puts("Creating admin user...")

# admin_user =
#   Repo.insert!(%User{
#     email: "admin@zonkeclubs.com",
#     username: "zonke_admin",
#     phone: "+27123456789",
#     password_hash: Bcrypt.hash_pwd_salt("password123"),
#     role: "club_owner",
#     onboarding_complete: true
#   })

# IO.puts("Creating nightclubs...")

# clubs_data = [
#   %{
#     name: "The Grand Africa Café & Beach",
#     description:
#       "Iconic beachfront venue with stunning ocean views, multiple dance floors, and top DJs. Famous for sunset parties and international acts.",
#     location: %{"name" => "Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8002"},
#     phone: "+27 21 425 0551",
#     email: "info@grandafrica.com",
#     dress_code: "Smart Casual - No flip-flops or sportswear",
#     entry_fee: "R100-R200 (varies by event)",
#     image: "grand_africa.jpg"
#   },
#   %{
#     name: "Kong",
#     description:
#       "Multi-level nightclub and restaurant in the heart of Cape Town's nightlife district. Known for themed parties and celebrity appearances.",
#     location: %{"name" => "Pepper St, Cape Town City Centre, Cape Town, 8001"},
#     phone: "+27 21 422 2330",
#     email: "bookings@kong.co.za",
#     dress_code: "Smart Casual - No sportswear",
#     entry_fee: "R80-R150",
#     image: "kong.jpg"
#   },
#   %{
#     name: "ERA",
#     description:
#       "Sophisticated nightclub in Sandton with state-of-the-art sound system and lighting. Premier destination for Johannesburg's elite.",
#     location: %{"name" => "Nelson Mandela Square, Sandton, Johannesburg, 2196"},
#     phone: "+27 11 784 1527",
#     email: "info@era.co.za",
#     dress_code: "Strictly Smart - No sneakers or jeans",
#     entry_fee: "R150-R300",
#     image: "era.jpg"
#   },
#   %{
#     name: "Taboo",
#     description:
#       "High-energy nightclub in Sandton known for themed nights and international DJ performances. Features VIP sections and bottle service.",
#     location: %{"name" => "Rivonia Rd, Sandhurst, Sandton, 2196"},
#     phone: "+27 11 883 3452",
#     email: "bookings@taboo.co.za",
#     dress_code: "Smart Casual to Smart",
#     entry_fee: "R100-R250",
#     image: "taboo.jpg"
#   },
#   %{
#     name: "Origin Nightclub",
#     description:
#       "Ultra-modern club in Durban's Florida Road entertainment district. Known for cutting-edge electronic music and immersive lighting.",
#     location: %{"name" => "18 Windermere Rd, Morningside, Durban, 4001"},
#     phone: "+27 31 303 4501",
#     email: "info@origindbn.com",
#     dress_code: "Smart Casual - No sportswear",
#     entry_fee: "R80-R150",
#     image: "origin.jpg"
#   },
#   %{
#     name: "The Chairman",
#     description:
#       "Upmarket nightclub and lounge in Umhlanga Ridge. Features resident DJs, live performances, and an extensive cocktail menu.",
#     location: %{"name" => "Chartwell Dr, Umhlanga Ridge, Umhlanga, 4319"},
#     phone: "+27 31 561 5847",
#     email: "bookings@thechairman.co.za",
#     dress_code: "Smart - No sneakers",
#     entry_fee: "R100-R200",
#     image: "chairman.jpg"
#   },
#   %{
#     name: "Cubana",
#     description:
#       "Latin-inspired nightclub in Waterfall with vibrant energy, salsa dancing, and tropical cocktails. Popular weekend destination.",
#     location: %{"name" => "Waterfall Corner, Midrand, Johannesburg, 1686"},
#     phone: "+27 11 549 1010",
#     email: "info@cubana.co.za",
#     dress_code: "Smart Casual",
#     entry_fee: "R80-R150",
#     image: "cubana.jpg"
#   },
#   %{
#     name: "Rockets",
#     description:
#       "Legendary Braamfontein nightclub known for live music, indie bands, and alternative crowd. A staple of Johannesburg's music scene.",
#     location: %{"name" => "50 De Korte St, Braamfontein, Johannesburg, 2001"},
#     phone: "+27 11 403 1630",
#     email: "info@rockets.co.za",
#     dress_code: "Casual - Come as you are",
#     entry_fee: "R50-R100",
#     image: "rockets.jpg"
#   },
#   %{
#     name: "Ayepyep Lifestyle Lounge",
#     description:
#       "Premier Pretoria nightclub featuring Afro House, Hip Hop, and live performances. Known for energetic atmosphere and top-tier sound.",
#     location: %{"name" => "Cnr Burnett & Festival St, Hatfield, Pretoria, 0083"},
#     phone: "+27 12 362 3344",
#     email: "bookings@ayepyep.co.za",
#     dress_code: "Smart Casual",
#     entry_fee: "R80-R120",
#     image: "ayepyep.jpg"
#   },
#   %{
#     name: "Arcade Empire",
#     description:
#       "Innovative Pretoria venue combining gaming arcade with nightclub. Features retro games, modern music, and unique atmosphere.",
#     location: %{"name" => "123 Lilian Ngoyi St, Pretoria Central, Pretoria, 0002"},
#     phone: "+27 12 004 0300",
#     email: "info@arcadeempire.co.za",
#     dress_code: "Casual to Smart Casual",
#     entry_fee: "R60-R100",
#     image: "arcade_empire.jpg"
#   },
#   %{
#     name: "Tiger's Milk",
#     description:
#       "Popular chain with locations across SA. Beachfront dining and clubbing venue with laid-back atmosphere and great music.",
#     location: %{"name" => "Shop 27, Victoria Wharf, V&A Waterfront, Cape Town, 8001"},
#     phone: "+27 21 433 2125",
#     email: "info@tigersmilk.co.za",
#     dress_code: "Casual",
#     entry_fee: "Free entry (restaurant converts to club)",
#     image: "tigers_milk.jpg"
#   },
#   %{
#     name: "Coco",
#     description:
#       "Exclusive Cape Town nightclub in Green Point with strict door policy. Features international DJs and premium bottle service.",
#     location: %{"name" => "70 Main Rd, Green Point, Cape Town, 8005"},
#     phone: "+27 21 418 8686",
#     email: "bookings@cococapetown.com",
#     dress_code: "Strictly Smart - Dress to impress",
#     entry_fee: "R150-R300",
#     image: "coco.jpg"
#   },
#   %{
#     name: "MODULAR",
#     description:
#       "Underground electronic music venue in Observatory, Cape Town. Known for cutting-edge techno, house, and experimental sounds.",
#     location: %{"name" => "8 Canterbury St, Observatory, Cape Town, 7925"},
#     phone: "+27 21 448 3773",
#     email: "info@modular.co.za",
#     dress_code: "Casual - All about the music",
#     entry_fee: "R50-R120",
#     image: "modular.jpg"
#   },
#   %{
#     name: "Fiction",
#     description:
#       "Premium nightclub in Sandton featuring world-class DJs, sophisticated crowd, and luxurious VIP areas. Johannesburg's finest.",
#     location: %{"name" => "Maude St, Sandown, Sandton, 2196"},
#     phone: "+27 11 784 5527",
#     email: "info@fiction.co.za",
#     dress_code: "Strictly Smart - Designer preferred",
#     entry_fee: "R200-R400",
#     image: "fiction.jpg"
#   },
#   %{
#     name: "The Avenue",
#     description:
#       "Sophisticated Rosebank venue with rooftop terrace. Features live music, DJ sets, and extensive drinks menu.",
#     location: %{"name" => "Tyrwhitt Ave, Rosebank, Johannesburg, 2196"},
#     phone: "+27 11 447 4794",
#     email: "bookings@theavenue.co.za",
#     dress_code: "Smart Casual",
#     entry_fee: "R80-R150",
#     image: "avenue.jpg"
#   },
#   %{
#     name: "Selective Live",
#     description:
#       "Durban's premier electronic music venue featuring local and international DJs. Known for quality sound system and intimate atmosphere.",
#     location: %{"name" => "45 Florence Nzama St, Durban Central, Durban, 4001"},
#     phone: "+27 31 303 1305",
#     email: "info@selectivelive.com",
#     dress_code: "Smart Casual",
#     entry_fee: "R80-R150",
#     image: "selective_live.jpg"
#   },
#   %{
#     name: "Clico Boutique Hotel & Club",
#     description:
#       "Unique concept combining boutique hotel with nightclub. Located in Rosebank with luxurious atmosphere and exclusive events.",
#     location: %{"name" => "Corner Tyrwhitt & Sturdee Ave, Rosebank, Johannesburg, 2196"},
#     phone: "+27 11 447 7471",
#     email: "info@clico.co.za",
#     dress_code: "Smart to Elegant",
#     entry_fee: "R120-R200",
#     image: "clico.jpg"
#   },
#   %{
#     name: "Sutra",
#     description:
#       "Opulent Oriental-themed nightclub in Sandton. Features dramatic décor, VIP lounges, and premium entertainment.",
#     location: %{"name" => "Grayston Dr, Sandton, Johannesburg, 2196"},
#     phone: "+27 11 784 5588",
#     email: "bookings@sutra.co.za",
#     dress_code: "Elegant - Dress to impress",
#     entry_fee: "R150-R300",
#     image: "sutra.jpg"
#   },
#   %{
#     name: "Assembly",
#     description:
#       "Historic Cape Town venue hosting major events, concerts, and club nights. Known for massive dance floors and top international acts.",
#     location: %{"name" => "61 Harrington St, Cape Town City Centre, Cape Town, 8001"},
#     phone: "+27 21 465 7286",
#     email: "info@assembly.co.za",
#     dress_code: "Casual to Smart Casual",
#     entry_fee: "R100-R500 (varies by event)",
#     image: "assembly.jpg"
#   },
#   %{
#     name: "Propaganda",
#     description:
#       "Popular LGBTQ+ friendly nightclub in Cape Town's city center. Known for inclusive atmosphere, themed parties, and vibrant energy.",
#     location: %{"name" => "33 Somerset Rd, Green Point, Cape Town, 8005"},
#     phone: "+27 21 300 1906",
#     email: "info@propaganda.bar",
#     dress_code: "Casual - Be yourself",
#     entry_fee: "R50-R100",
#     image: "propaganda.jpg"
#   }
# ]

# # Insert clubs and create asset placeholders
# Enum.each(clubs_data, fn club_data ->
#   image_filename = club_data.image

#   club =
#     Repo.insert!(%Club{
#       name: club_data.name,
#       description: club_data.description,
#       location: club_data.location,
#       phone: club_data.phone,
#       email: club_data.email,
#       dress_code: club_data.dress_code,
#       entry_fee: club_data.entry_fee,
#       active: true,
#       user_id: admin_user.id
#     })

#   # Create asset record for the club image
#   Repo.insert!(%Asset{
#     filename: image_filename,
#     copied: false,
#     meta: %{type: "club_image"},
#     club_id: club.id
#   })

#   IO.puts("✓ Created club: #{club.name}")
# end)

# IO.puts("\n🎉 Seeding complete!")
# IO.puts("Created 20 nightclubs across South Africa")
# IO.puts("\nNote: Club images should be placed in: backend/priv/clubs/")
# IO.puts("Image filenames are stored in the assets table.")

# # Create test users for messaging
# IO.puts("\nCreating test users for messaging...")

# test_users = [
#   Repo.insert!(%User{
#     email: "john@test.com",
#     username: "johnsmith",
#     phone: "+27823456789",
#     password_hash: Bcrypt.hash_pwd_salt("password123"),
#     role: "user",
#     onboarding_complete: true,
#     bio: "Music lover | Party enthusiast"
#   }),
#   Repo.insert!(%User{
#     email: "sarah@test.com",
#     username: "sarahjohnson",
#     phone: "+27823456790",
#     password_hash: Bcrypt.hash_pwd_salt("password123"),
#     role: "user",
#     onboarding_complete: true,
#     bio: "House music addict"
#   }),
#   Repo.insert!(%User{
#     email: "mike@test.com",
#     username: "mikewilliams",
#     phone: "+27823456791",
#     password_hash: Bcrypt.hash_pwd_salt("password123"),
#     role: "user",
#     onboarding_complete: true,
#     bio: "Weekend warrior | DJ in training"
#   })
# ]

# IO.puts("✓ Created #{length(test_users)} test users")

# # Create threads and messages between admin and test users
# IO.puts("\nCreating message threads...")

# Enum.each(test_users, fn user ->
#   # Create thread
#   thread = Repo.insert!(%Thread{})

#   # Add participants
#   Repo.insert!(%ThreadParticipant{
#     thread_id: thread.id,
#     user_id: admin_user.id
#   })

#   Repo.insert!(%ThreadParticipant{
#     thread_id: thread.id,
#     user_id: user.id
#   })

#   # Add some messages
#   now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

#   Repo.insert!(%Message{
#     thread_id: thread.id,
#     sender_id: user.id,
#     content:
#       "Hey! Are you going to #{Enum.random(["The Grand Africa", "Kong", "ERA"])} this weekend?",
#     is_read: false,
#     inserted_at: NaiveDateTime.add(now, -3600, :second)
#   })

#   Repo.insert!(%Message{
#     thread_id: thread.id,
#     sender_id: admin_user.id,
#     content: "Yeah! Should be a great night. The lineup looks amazing 🔥",
#     is_read: true,
#     inserted_at: NaiveDateTime.add(now, -1800, :second)
#   })

#   Repo.insert!(%Message{
#     thread_id: thread.id,
#     sender_id: user.id,
#     content: "Perfect! See you there 🎉",
#     is_read: false,
#     inserted_at: now
#   })

#   IO.puts("✓ Created thread with #{user.username}")
# end)

# IO.puts("\n✅ Messaging seed data complete!")
# IO.puts("\nTest users created (all with password: password123):")
# IO.puts("  • admin@zonkeclubs.com (Zonke Admin)")
# IO.puts("  • john@test.com (John Smith)")
# IO.puts("  • sarah@test.com (Sarah Johnson)")
# IO.puts("  • mike@test.com (Mike Williams)")

# # Create posts for pagination testing
# IO.puts("\nCreating posts for pagination testing...")

# # Get first club for posts
# first_club = Repo.all(Club) |> List.first()

# # Captions for posts
# captions = [
#   "Had an amazing night! 🔥",
#   "The vibes were unreal",
#   "Best DJ set I've heard in months",
#   "Can't wait to come back here",
#   "What a party! 🎉",
#   "Epic night with the crew",
#   "This place never disappoints",
#   "Absolutely incredible atmosphere",
#   "Dance floor was on fire 💃",
#   "Perfect way to end the week",
#   "The music was perfect",
#   "Made so many new friends tonight",
#   "This is my new favorite spot",
#   "Legendary night",
#   "10/10 would recommend",
#   "The energy here is unmatched",
#   "Already planning my next visit",
#   "What a vibe!",
#   "Best night out in a while",
#   "This place is magical ✨",
#   "The DJ killed it",
#   "So much fun!",
#   "Amazing crowd tonight",
#   "Love this place",
#   "Can't stop thinking about last night"
# ]

# # Image URLs (placeholder)
# image_urls = [
#   "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
#   "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
#   "https://images.unsplash.com/photo-1571266028243-d220c6c5d995",
#   "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
#   "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
#   "https://images.unsplash.com/photo-1571266028243-d220c6c5d995",
#   "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
#   "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1",
#   "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae"
# ]

# video_urls = [
#   "https://example.com/video1.mp4",
#   "https://example.com/video2.mp4",
#   "https://example.com/video3.mp4"
# ]

# # Status distribution (weighted for more pending than approved/rejected)
# statuses = [
#   "pending",
#   "pending",
#   "pending",
#   "pending",
#   "pending",
#   "approved",
#   "approved",
#   "rejected"
# ]

# # Generate 150 posts distributed over the past 30 days
# all_users = [admin_user | test_users]
# now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

# Enum.each(1..150, fn index ->
#   user = Enum.random(all_users)
#   status = Enum.random(statuses)
#   media_type = if rem(index, 8) == 0, do: "video", else: "image"

#   media_url =
#     if media_type == "video" do
#       Enum.random(video_urls)
#     else
#       Enum.random(image_urls)
#     end

#   # Distribute posts over past 30 days (more recent posts)
#   days_ago = :rand.uniform(30)
#   hours_ago = :rand.uniform(24)
#   minutes_ago = :rand.uniform(60)
#   seconds_offset = -(days_ago * 86400 + hours_ago * 3600 + minutes_ago * 60)

#   Repo.insert!(%Post{
#     user_id: user.id,
#     club_id: first_club.id,
#     caption: Enum.random(captions),
#     media_type: media_type,
#     media_url: media_url,
#     status: status,
#     inserted_at: NaiveDateTime.add(now, seconds_offset, :second),
#     updated_at: NaiveDateTime.add(now, seconds_offset, :second)
#   })

#   if rem(index, 30) == 0 do
#     IO.write(".")
#   end
# end)

# post_count = Repo.aggregate(Post, :count)
# pending_count = Repo.aggregate(from(p in Post, where: p.status == "pending"), :count)
# approved_count = Repo.aggregate(from(p in Post, where: p.status == "approved"), :count)
# rejected_count = Repo.aggregate(from(p in Post, where: p.status == "rejected"), :count)

# IO.puts("\n✅ Posts seed data complete!")
# IO.puts("\nCreated #{post_count} posts:")
# IO.puts("  • Pending: #{pending_count}")
# IO.puts("  • Approved: #{approved_count}")
# IO.puts("  • Rejected: #{rejected_count}")
# IO.puts("\nYou can now test pagination in the Content Moderation screen!")

# # Create users with intentions for testing meetup functionality
# IO.puts("\n\nCreating users with intentions for meetup testing...")

# # Get clubs for intentions
# all_clubs = Repo.all(Club)
# arcade_empire = Enum.find(all_clubs, fn club -> club.name == "Arcade Empire" end) || List.first(all_clubs)
# grand_africa = Enum.find(all_clubs, fn club -> club.name == "The Grand Africa Café & Beach" end) || List.first(all_clubs)
# kong = Enum.find(all_clubs, fn club -> club.name == "Kong" end) || List.first(all_clubs)
# era = Enum.find(all_clubs, fn club -> club.name == "ERA" end) || List.first(all_clubs)

# # Avatar URLs from Unsplash
# avatars_women = [
#   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop"
# ]

# avatars_men = [
#   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop",
#   "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=1200&fit=crop"
# ]

# # Create users for intentions
# intention_users = [
#   %{
#     email: "emma@test.com",
#     first_name: "Emma",
#     last_name: "Wilson",
#     username: "emmawilson",
#     phone: "+27823456792",
#     avatar_url: Enum.at(avatars_women, 0),
#     bio: "Dance enthusiast and cocktail lover. Always down for a good time on the dance floor!"
#   },
#   %{
#     email: "james@test.com",
#     first_name: "James",
#     last_name: "Brown",
#     username: "jamesbrown",
#     phone: "+27823456793",
#     avatar_url: Enum.at(avatars_men, 0),
#     bio: "Mixologist by day, party-goer by night. Love trying new drinks and meeting new people."
#   },
#   %{
#     email: "sophia@test.com",
#     first_name: "Sophia",
#     last_name: "Martinez",
#     username: "sophiam",
#     phone: "+27823456794",
#     avatar_url: Enum.at(avatars_women, 1),
#     bio: "New to Cape Town! Looking to make friends and explore the nightlife scene."
#   },
#   %{
#     email: "liam@test.com",
#     first_name: "Liam",
#     last_name: "Davis",
#     username: "liamdavis",
#     phone: "+27823456795",
#     avatar_url: Enum.at(avatars_men, 1),
#     bio: "Music lover with a passion for house and techno. Let's dance!"
#   },
#   %{
#     email: "olivia@test.com",
#     first_name: "Olivia",
#     last_name: "Taylor",
#     username: "oliviataylor",
#     phone: "+27823456796",
#     avatar_url: Enum.at(avatars_women, 2),
#     bio: "Social butterfly who loves meeting new people. Good vibes only!"
#   },
#   %{
#     email: "noah@test.com",
#     first_name: "Noah",
#     last_name: "Anderson",
#     username: "noahanderson",
#     phone: "+27823456797",
#     avatar_url: Enum.at(avatars_men, 2),
#     bio: "Fitness junkie by day, club enthusiast by night. Balance is key!"
#   },
#   %{
#     email: "ava@test.com",
#     first_name: "Ava",
#     last_name: "Thomas",
#     username: "avathomas",
#     phone: "+27823456798",
#     avatar_url: Enum.at(avatars_women, 3),
#     bio: "Travel addict and adventure seeker. Always up for spontaneous fun!"
#   },
#   %{
#     email: "ethan@test.com",
#     first_name: "Ethan",
#     last_name: "Moore",
#     username: "ethanmoore",
#     phone: "+27823456799",
#     avatar_url: Enum.at(avatars_men, 3),
#     bio: "Food and drink connoisseur. Love trying new cocktails and good conversation."
#   },
#   %{
#     email: "mia@test.com",
#     first_name: "Mia",
#     last_name: "Jackson",
#     username: "miajackson",
#     phone: "+27823456800",
#     avatar_url: Enum.at(avatars_women, 4),
#     bio: "Artist and creative soul. Music festivals and clubs are my happy place."
#   },
#   %{
#     email: "lucas@test.com",
#     first_name: "Lucas",
#     last_name: "White",
#     username: "lucaswhite",
#     phone: "+27823456801",
#     avatar_url: Enum.at(avatars_men, 4),
#     bio: "Entrepreneur with a love for nightlife. Work hard, party harder!"
#   },
#   %{
#     email: "isabella@test.com",
#     first_name: "Isabella",
#     last_name: "Harris",
#     username: "isabellaharris",
#     phone: "+27823456802",
#     avatar_url: Enum.at(avatars_women, 5),
#     bio: "Former dancer turned party enthusiast. Love salsa, bachata, and everything in between."
#   },
#   %{
#     email: "mason@test.com",
#     first_name: "Mason",
#     last_name: "Clark",
#     username: "masonclark",
#     phone: "+27823456803",
#     avatar_url: Enum.at(avatars_men, 5),
#     bio: "Photographer capturing nightlife moments. Always looking for the next great party."
#   },
#   %{
#     email: "charlotte@test.com",
#     first_name: "Charlotte",
#     last_name: "Lewis",
#     username: "charlottelewis",
#     phone: "+27823456804",
#     avatar_url: Enum.at(avatars_women, 6),
#     bio: "Tech professional who unwinds on the dance floor. Let's connect!"
#   },
#   %{
#     email: "logan@test.com",
#     first_name: "Logan",
#     last_name: "Walker",
#     username: "loganwalker",
#     phone: "+27823456805",
#     avatar_url: Enum.at(avatars_men, 6),
#     bio: "Music producer exploring the scene. Love discovering new sounds and vibes."
#   },
#   %{
#     email: "amelia@test.com",
#     first_name: "Amelia",
#     last_name: "Hall",
#     username: "ameliahall",
#     phone: "+27823456806",
#     avatar_url: Enum.at(avatars_women, 7),
#     bio: "Yoga instructor who loves to let loose on weekends. Balance in everything!"
#   }
# ]

# created_users =
#   Enum.map(intention_users, fn user_data ->
#     user =
#       Repo.insert!(%User{
#         email: user_data.email,
#         username: user_data.username,
#         phone: user_data.phone,
#         password_hash: Bcrypt.hash_pwd_salt("password123"),
#         role: "user",
#         onboarding_complete: true,
#         bio: user_data.bio,
#         avatar_url: user_data.avatar_url
#       })

#     IO.puts("✓ Created user: #{user.username}")
#     user
#   end)

# # Helper to get date for intentions
# defmodule DateHelper do
#   def get_date(days_from_now) do
#     Date.utc_today() |> Date.add(days_from_now)
#   end

#   def get_expires_at(days_from_now) do
#     DateTime.utc_now()
#     |> DateTime.add(days_from_now * 24 * 60 * 60, :second)
#     |> DateTime.truncate(:second)
#   end
# end

# # Create intentions for these users
# IO.puts("\nCreating intentions...")

# intention_data = [
#   # Arcade Empire intentions
#   %{
#     user: Enum.at(created_users, 0),
#     club: arcade_empire,
#     activity_type: "dancing_partner",
#     planned_date: DateHelper.get_date(0),
#     planned_time: "evening",
#     message: "Love salsa and bachata! Looking for someone to dance with tonight.",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 1),
#     club: arcade_empire,
#     activity_type: "drinking_buddy",
#     planned_date: DateHelper.get_date(0),
#     planned_time: "late night",
#     message: "First time here, want to explore the cocktail menu!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 2),
#     club: arcade_empire,
#     activity_type: "new_friends",
#     planned_date: DateHelper.get_date(1),
#     planned_time: nil,
#     message: "New to the city, looking to meet cool people!",
#     expires_at: DateHelper.get_expires_at(1)
#   },
#   %{
#     user: Enum.at(created_users, 3),
#     club: arcade_empire,
#     activity_type: "open_to_anything",
#     planned_date: DateHelper.get_date(0),
#     planned_time: nil,
#     message: "Just here for good vibes!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 4),
#     club: arcade_empire,
#     activity_type: "dancing_partner",
#     planned_date: DateHelper.get_date(2),
#     planned_time: "evening",
#     message: nil,
#     expires_at: DateHelper.get_expires_at(2)
#   },
#   # Grand Africa intentions
#   %{
#     user: Enum.at(created_users, 5),
#     club: grand_africa,
#     activity_type: "drinking_buddy",
#     planned_date: DateHelper.get_date(0),
#     planned_time: "evening",
#     message: "Sunset drinks with ocean views? Count me in!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 6),
#     club: grand_africa,
#     activity_type: "new_friends",
#     planned_date: DateHelper.get_date(1),
#     planned_time: nil,
#     message: "Love the beachfront vibe here. Let's connect!",
#     expires_at: DateHelper.get_expires_at(1)
#   },
#   %{
#     user: Enum.at(created_users, 7),
#     club: grand_africa,
#     activity_type: "dancing_partner",
#     planned_date: DateHelper.get_date(0),
#     planned_time: "late night",
#     message: "House music and ocean breeze - perfect combo!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   # Kong intentions
#   %{
#     user: Enum.at(created_users, 8),
#     club: kong,
#     activity_type: "open_to_anything",
#     planned_date: DateHelper.get_date(0),
#     planned_time: nil,
#     message: "Celebrating my birthday! Join the party!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 9),
#     club: kong,
#     activity_type: "dancing_partner",
#     planned_date: DateHelper.get_date(1),
#     planned_time: "evening",
#     message: "Hip hop and R&B lover looking for dance partner.",
#     expires_at: DateHelper.get_expires_at(1)
#   },
#   %{
#     user: Enum.at(created_users, 10),
#     club: kong,
#     activity_type: "new_friends",
#     planned_date: DateHelper.get_date(0),
#     planned_time: nil,
#     message: nil,
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   # ERA intentions
#   %{
#     user: Enum.at(created_users, 11),
#     club: era,
#     activity_type: "drinking_buddy",
#     planned_date: DateHelper.get_date(0),
#     planned_time: "late night",
#     message: "Premium vibes and cocktails at ERA. Who's in?",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 12),
#     club: era,
#     activity_type: "dancing_partner",
#     planned_date: DateHelper.get_date(2),
#     planned_time: "evening",
#     message: "Techno and deep house lover. Let's dance!",
#     expires_at: DateHelper.get_expires_at(2)
#   },
#   %{
#     user: Enum.at(created_users, 13),
#     club: era,
#     activity_type: "open_to_anything",
#     planned_date: DateHelper.get_date(0),
#     planned_time: nil,
#     message: "Looking for a sophisticated night out!",
#     expires_at: DateHelper.get_expires_at(0)
#   },
#   %{
#     user: Enum.at(created_users, 14),
#     club: era,
#     activity_type: "new_friends",
#     planned_date: DateHelper.get_date(1),
#     planned_time: nil,
#     message: "New to Sandton nightlife. Show me around?",
#     expires_at: DateHelper.get_expires_at(1)
#   }
# ]

# Enum.each(intention_data, fn data ->
#   Repo.insert!(%Intention{
#     user_id: data.user.id,
#     club_id: data.club.id,
#     activity_type: data.activity_type,
#     planned_date: data.planned_date,
#     planned_time: data.planned_time,
#     message: data.message,
#     active: true,
#     expires_at: data.expires_at
#   })

#   IO.puts("✓ Created intention for #{data.user.username} at #{data.club.name}")
# end)

# intention_count = Repo.aggregate(Intention, :count)

# IO.puts("\n✅ Intentions seed data complete!")
# IO.puts("\nCreated #{length(created_users)} users with #{intention_count} intentions")
# IO.puts("\nTest users for intentions (all with password: password123):")

# Enum.each(intention_users, fn user ->
#   IO.puts("  • #{user.email} (#{user.username})")
# end)

# IO.puts("\n🎉 All seed data complete!")
# IO.puts("\nYou can now:")
# IO.puts("  • Browse people looking to meet at clubs")
# IO.puts("  • Send connection requests")
# IO.puts("  • Start conversations")
# IO.puts("  • View user profiles")
