# Seeds dummy events for pagination testing.
# Run with: mix run priv/repo/seeds_events.exs
#
# Requires at least one admin to exist in the database.
# Uses the first admin found (or pass email via ENV: ADMIN_EMAIL=x mix run ...)

import Ecto.Query

alias Backend.Repo
alias Backend.Admin.{Admin, Event}

# ── Find admin ─────────────────────────────────────────────────────────────────
admin =
  case System.get_env("ADMIN_EMAIL") do
    nil ->
      Repo.one!(from a in Admin, limit: 1)

    email ->
      Repo.get_by!(Admin, email: email)
  end

IO.puts("Seeding events for admin: #{admin.email} (#{admin.id})")

# ── Clear existing events for this admin ───────────────────────────────────────
{deleted, _} = Repo.delete_all(from e in Event, where: e.admin_id == ^admin.id)
IO.puts("Cleared #{deleted} existing event(s).")

# ── Helpers ────────────────────────────────────────────────────────────────────
future_date = fn days_ahead ->
  Date.utc_today() |> Date.add(days_ahead)
end

now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

# ── Event data (30 entries) ────────────────────────────────────────────────────
events_data = [
  %{
    title: "Neon Nights Vol. 1",
    description: "Kick off the season with an electrifying night of Afro House and deep beats. Featuring our resident DJ collective and a special guest from Johannesburg.",
    date: future_date.(3),
    start_time: "21:00",
    end_time: "04:00",
    general_entry_price: "120.00",
    vip_entry_price: "350.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Amapiano Sundays",
    description: "The ultimate Sunday session. Pianos, log drums, and flutes echoing until sunset. Bring your crew for the most chilled vibes of the week.",
    date: future_date.(5),
    start_time: "14:00",
    end_time: "22:00",
    general_entry_price: "80.00",
    vip_entry_price: "200.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Ladies Night Extravaganza",
    description: "An unforgettable evening dedicated to the ladies. Complimentary cocktails from 9–10 PM, live DJ, and surprise celebrity appearances.",
    date: future_date.(7),
    start_time: "20:00",
    end_time: "03:00",
    general_entry_price: "0.00",
    vip_entry_price: "250.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Tech House Takeover",
    description: "Four floors, four sounds. The best tech house and techno selectors in the country converge for one massive night.",
    date: future_date.(10),
    start_time: "22:00",
    end_time: "06:00",
    general_entry_price: "150.00",
    vip_entry_price: "400.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Hip Hop Fridays",
    description: "The freshest hip hop, trap, and R&B anthems. No-skip playlist from 10 PM. Come in your freshest fits and get ready to vibe.",
    date: future_date.(4),
    start_time: "21:00",
    end_time: "04:00",
    general_entry_price: "100.00",
    vip_entry_price: "300.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Sunset Rooftop Sessions",
    description: "Sip sundowners on the rooftop terrace as the sky turns orange. Deep house sets with panoramic city views. Limited capacity – book early.",
    date: future_date.(6),
    start_time: "17:00",
    end_time: "23:00",
    general_entry_price: "90.00",
    vip_entry_price: "220.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Reggae & Rum Night",
    description: "Island vibes meet township energy. Live reggae band, rum punch specials, and a midnight DJ set. Dress code: colourful and comfortable.",
    date: future_date.(12),
    start_time: "19:00",
    end_time: "02:00",
    general_entry_price: "70.00",
    vip_entry_price: "180.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "White Party 2026",
    description: "Annual all-white affair. Strictly enforced dress code – all white from head to toe. Spectacular lighting, foam machines, and non-stop dancing.",
    date: future_date.(14),
    start_time: "20:00",
    end_time: "04:00",
    general_entry_price: "180.00",
    vip_entry_price: "500.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Gqom Invasion",
    description: "Durban's finest gqom DJs invade the capital for one night only. Expect heavy 808s, tribal rhythms, and a dancefloor that never stops.",
    date: future_date.(9),
    start_time: "22:00",
    end_time: "05:00",
    general_entry_price: "100.00",
    vip_entry_price: "280.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Jazz & Cocktails Evening",
    description: "A sophisticated evening featuring live jazz quartet, signature cocktail pairings, and a curated menu. Perfect for a special night out.",
    date: future_date.(11),
    start_time: "18:30",
    end_time: "23:30",
    general_entry_price: "200.00",
    vip_entry_price: "450.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Carnival Night",
    description: "Bring the carnival spirit inside. Costumes encouraged, street food stalls, live drumming, and back-to-back DJ sets across two stages.",
    date: future_date.(18),
    start_time: "19:00",
    end_time: "04:00",
    general_entry_price: "130.00",
    vip_entry_price: "320.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Throwback Thursday",
    description: "Old school vibes only. 90s hip hop, early 2000s R&B, and classic house anthems. Dress like it's 1999 for a free drink on entry.",
    date: future_date.(8),
    start_time: "20:00",
    end_time: "03:00",
    general_entry_price: "60.00",
    vip_entry_price: "160.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "All Black Everything",
    description: "Sleek, dark, exclusive. All-black dress code strictly enforced. Premium bottle service, low lighting, and the hottest selectors in town.",
    date: future_date.(15),
    start_time: "21:00",
    end_time: "05:00",
    general_entry_price: "160.00",
    vip_entry_price: "420.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Beach Vibes Pool Party",
    description: "Swimwear, sunscreen, and serious beats. Pool party starting at noon with outdoor DJ booth. Transition to indoor club at sunset.",
    date: future_date.(20),
    start_time: "12:00",
    end_time: "23:00",
    general_entry_price: "110.00",
    vip_entry_price: "300.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Masked Masquerade Ball",
    description: "Glamour, mystery, and music. Masks provided at the door. Three floors of music, a champagne tower, and a midnight unmasking ceremony.",
    date: future_date.(22),
    start_time: "20:00",
    end_time: "04:00",
    general_entry_price: "220.00",
    vip_entry_price: "550.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Brunch & Beats",
    description: "Saturday brunch with bottomless mimosas and a live DJ. Premium food menu, relaxed atmosphere, perfect for a late start to the weekend.",
    date: future_date.(16),
    start_time: "10:00",
    end_time: "16:00",
    general_entry_price: "250.00",
    vip_entry_price: "450.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Africa Day Celebration",
    description: "Celebrating the diversity of African music – afrobeats, afro house, highlife, kwaito, and more. One continent, one dancefloor.",
    date: future_date.(25),
    start_time: "18:00",
    end_time: "04:00",
    general_entry_price: "140.00",
    vip_entry_price: "380.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Student Night",
    description: "Valid student card gets you in for R50 before midnight. Cheap drinks, massive DJ lineup, and the best student crowd in the city.",
    date: future_date.(2),
    start_time: "20:00",
    end_time: "04:00",
    general_entry_price: "50.00",
    vip_entry_price: "150.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Couples Night",
    description: "Bring your partner for a discounted entry rate. Rose petal décor, romantic lighting, a chill lounge zone, and a passionate playlist.",
    date: future_date.(13),
    start_time: "19:00",
    end_time: "02:00",
    general_entry_price: "100.00",
    vip_entry_price: "260.00",
    dj_lineup: [],
    status: "published"
  },
  %{
    title: "Drum & Bass Marathon",
    description: "12 hours of drum and bass from local heroes and international names. Two rooms, one mission: dance until you drop.",
    date: future_date.(28),
    start_time: "18:00",
    end_time: "06:00",
    general_entry_price: "170.00",
    vip_entry_price: "430.00",
    dj_lineup: [],
    status: "published"
  },
  # Draft events (planning stage)
  %{
    title: "New Year's Eve Countdown 2027",
    description: "Our biggest event of the year. Fireworks display at midnight, champagne on arrival, and world-class headline acts. Save the date.",
    date: future_date.(290),
    start_time: "20:00",
    end_time: "06:00",
    general_entry_price: "400.00",
    vip_entry_price: "1200.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Heritage Day Block Party",
    description: "A tribute to South African culture. Traditional food, live performances, fashion showcase, and an all-night celebration of heritage.",
    date: future_date.(35),
    start_time: "15:00",
    end_time: "04:00",
    general_entry_price: "100.00",
    vip_entry_price: "280.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Valentine's Exclusive",
    description: "The most romantic night of the year. Tables dressed for two, live saxophone, rose gifting, and a champagne service upgrade.",
    date: future_date.(60),
    start_time: "19:00",
    end_time: "02:00",
    general_entry_price: "180.00",
    vip_entry_price: "480.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Summer Closing Party",
    description: "The last big outdoor event before the season changes. Pool, live acts, and a lineup that will be remembered for years.",
    date: future_date.(45),
    start_time: "13:00",
    end_time: "23:00",
    general_entry_price: "150.00",
    vip_entry_price: "380.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Easter Weekend Bash",
    description: "Four days, four nights. The Easter long weekend takeover with different themes each night – something for everyone.",
    date: future_date.(50),
    start_time: "21:00",
    end_time: "05:00",
    general_entry_price: "120.00",
    vip_entry_price: "320.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Freedom Day Festival",
    description: "A tribute to freedom through music, art, and culture. Three stages of live performances, food market, and DJ sets all day.",
    date: future_date.(40),
    start_time: "12:00",
    end_time: "23:00",
    general_entry_price: "90.00",
    vip_entry_price: "230.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Winter Warmer Series #1",
    description: "Cosy up inside for warm cocktails, comfort food, and soulful beats to chase away the winter chill. First of a monthly series.",
    date: future_date.(55),
    start_time: "18:00",
    end_time: "02:00",
    general_entry_price: "80.00",
    vip_entry_price: "200.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Women's Month Gala",
    description: "A premium gala evening celebrating women. Strictly women and male allies. Fashion show, live performances, and empowerment panel.",
    date: future_date.(70),
    start_time: "18:00",
    end_time: "23:00",
    general_entry_price: "200.00",
    vip_entry_price: "500.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "International DJ Showcase",
    description: "Three world-renowned DJs, one night. To be announced. Follow our socials for the lineup reveal. Tickets will sell fast.",
    date: future_date.(80),
    start_time: "22:00",
    end_time: "08:00",
    general_entry_price: "250.00",
    vip_entry_price: "700.00",
    dj_lineup: [],
    status: "draft"
  },
  %{
    title: "Anniversary Night – Year 5",
    description: "Five years of unforgettable nights. We're pulling out all the stops for our biggest anniversary celebration yet. Stay tuned.",
    date: future_date.(100),
    start_time: "20:00",
    end_time: "06:00",
    general_entry_price: "300.00",
    vip_entry_price: "800.00",
    dj_lineup: [],
    status: "draft"
  }
]

# ── Insert events ──────────────────────────────────────────────────────────────
Enum.each(events_data, fn data ->
  Repo.insert!(%Event{
    title: data.title,
    description: data.description,
    date: data.date,
    start_time: data.start_time,
    end_time: data.end_time,
    general_entry_price: Decimal.new(data.general_entry_price),
    vip_entry_price: Decimal.new(data.vip_entry_price),
    dj_lineup: data.dj_lineup,
    cover_image: nil,
    status: data.status,
    admin_id: admin.id,
    inserted_at: now,
    updated_at: now
  })

  IO.puts("✓ #{data.status |> String.pad_trailing(9)} #{data.date}  #{data.title}")
end)

total = Repo.aggregate(from(e in Event, where: e.admin_id == ^admin.id), :count)
published = Repo.aggregate(from(e in Event, where: e.admin_id == ^admin.id and e.status == "published"), :count)
draft = Repo.aggregate(from(e in Event, where: e.admin_id == ^admin.id and e.status == "draft"), :count)

IO.puts("""

✅ Events seed complete!
   Total : #{total}
   Published : #{published}
   Draft     : #{draft}

With page_size=10 you should see 3 pages of events.
Run: mix run priv/repo/seeds_events.exs
""")
