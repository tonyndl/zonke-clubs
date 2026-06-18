defmodule Backend.Factory do
  @moduledoc """
  ExMachina factory for creating test data.

  Usage:
    import Backend.Factory

    user = insert(:user)
    user_with_password = insert(:user, :with_password)
    club = insert(:club, :admin_owned)
  """

  use ExMachina.Ecto, repo: Backend.Repo

  # User factory
  def user_factory do
    %Backend.Accounts.User{
      id: Ecto.UUID.generate(),
      username: sequence(:username, &"user#{&1}"),
      email: sequence(:email, &"user#{&1}@example.com"),
      password_hash: Bcrypt.hash_pwd_salt("password123"),
      role: "club_goer",
      bio: nil,
      favorite_drinks: [],
      location: nil,
      avatar_url: nil,
      onboarding_complete: false,
      last_seen_at: nil
    }
  end

  # Trait for tests needing password validation (registration, login)
  def with_password(user) do
    %{user | password: "password123"}
  end

  # Admin factory
  def admin_factory do
    %Backend.Admin.Admin{
      id: Ecto.UUID.generate(),
      email: sequence(:admin_email, &"admin#{&1}@example.com"),
      name: sequence(:admin_name, &"Admin #{&1}"),
      password_hash: Bcrypt.hash_pwd_salt("admin123"),
      role: "club_admin",
      phone: nil,
      avatar_url: nil,
      active: true
    }
  end

  # Trait for admin with password (for registration/login tests)
  def admin_with_password(admin) do
    %{admin | password: "admin123"}
  end

  # Club factory (default: user-owned)
  def club_factory do
    user = insert(:user)

    %Backend.Clubs.Club{
      id: Ecto.UUID.generate(),
      name: sequence(:club_name, &"Club #{&1}"),
      description: "An amazing nightclub in Cape Town",
      location: %{
        "name" => "Cape Town, South Africa",
        "latitude" => -33.9249,
        "longitude" => 18.4241
      },
      user_id: user.id,
      admin_id: nil,
      email: nil,
      phone: nil,
      active: true,
      dress_code: nil,
      entry_fee: nil,
      opening_hours: %{}
    }
  end

  # Trait for admin-owned club
  def admin_owned(club) do
    admin = insert(:admin)
    %{club | user_id: nil, admin_id: admin.id}
  end

  # ClubLike factory
  def club_like_factory do
    %Backend.Clubs.ClubLike{
      id: Ecto.UUID.generate(),
      user: build(:user),
      club: build(:club)
    }
  end

  # Post factory
  def post_factory do
    %Backend.Posts.Post{
      id: Ecto.UUID.generate(),
      caption: "Check out this amazing night!",
      status: "pending",
      media_type: nil,
      media_url: nil,
      club_approved_at: nil,
      user: build(:user),
      club: build(:club)
    }
  end

  # Trait for approved post
  def approved(post) do
    %{post | status: "approved", club_approved_at: NaiveDateTime.utc_now()}
  end

  # Trait for rejected post
  def rejected(post) do
    %{post | status: "rejected"}
  end

  # PostLike factory
  def post_like_factory do
    %Backend.Posts.PostLike{
      id: Ecto.UUID.generate(),
      user: build(:user),
      post: build(:post)
    }
  end

  # Asset factory
  def asset_factory do
    %Backend.Assets.Asset{
      id: Ecto.UUID.generate(),
      filename: sequence(:filename, &"image_#{&1}.jpg"),
      copied: false,
      meta: %{},
      user: build(:user),
      club_id: nil,
      post_id: nil
    }
  end

  # Connection Request factory
  def connection_request_factory do
    sender = insert(:user)
    receiver = insert(:user)
    club = insert(:club)
    intention = insert(:intention, user: sender, club: club)

    %Backend.Connections.ConnectionRequest{
      id: Ecto.UUID.generate(),
      sender_id: sender.id,
      receiver_id: receiver.id,
      club_id: club.id,
      intention_id: intention.id,
      status: "pending",
      message: "Let's connect and have a great night!",
      thread_id: nil
    }
  end

  # Trait for accepted connection with thread
  def accepted(connection_request) do
    thread = insert(:thread)

    connection_request
    |> Backend.Repo.preload([:sender, :receiver])
    |> Map.put(:status, "accepted")
    |> Map.put(:thread_id, thread.id)
  end

  # Thread factory
  def thread_factory do
    %Backend.Messenger.Thread{
      id: Ecto.UUID.generate()
    }
  end

  # ThreadParticipant factory
  def thread_participant_factory do
    %Backend.Messenger.ThreadParticipant{
      id: Ecto.UUID.generate(),
      thread: build(:thread),
      user: build(:user)
    }
  end

  # Message factory
  def message_factory do
    thread = insert(:thread)
    sender = insert(:user)
    # Add sender as participant
    insert(:thread_participant, thread: thread, user: sender)

    %Backend.Messenger.Message{
      id: Ecto.UUID.generate(),
      thread_id: thread.id,
      sender_id: sender.id,
      content: "Hello! How are you?",
      is_read: false,
      status: "sent"
    }
  end

  # Intention factory
  def intention_factory do
    %Backend.Intentions.Intention{
      id: Ecto.UUID.generate(),
      user: build(:user),
      club: build(:club),
      activity_type: "new_friends",
      planned_date: Date.utc_today() |> Date.add(1),
      planned_time: nil,
      message: nil,
      active: true,
      expires_at: nil
    }
  end

  # Trait for expired intention
  def expired(intention) do
    %{intention | planned_date: Date.utc_today() |> Date.add(-7), active: false}
  end

  # DJ factory
  def dj_factory do
    %Backend.DJs.DJ{
      id: Ecto.UUID.generate(),
      name: sequence(:dj_name, &"DJ #{&1}"),
      bio: "An amazing DJ bringing the vibes!",
      genre: "House",
      instagram: nil,
      soundcloud: nil,
      image_url: nil,
      club: build(:club)
    }
  end

  # DJSchedule factory
  def dj_schedule_factory do
    %Backend.DJs.DJSchedule{
      id: Ecto.UUID.generate(),
      type: "weekly",
      day_of_week: 5,
      start_time: ~T[22:00:00],
      end_time: ~T[02:00:00],
      notes: nil,
      specific_date: nil,
      dj: build(:dj),
      club: build(:club)
    }
  end

  # Event factory
  def event_factory do
    admin = insert(:admin)

    %Backend.Admin.Event{
      id: Ecto.UUID.generate(),
      title: sequence(:event_title, &"Summer Party #{&1}"),
      description: "The hottest party of the season! Come join us for an unforgettable night.",
      date: Date.utc_today() |> Date.add(7),
      start_time: "22:00",
      end_time: "04:00",
      general_entry_price: Decimal.new("150.00"),
      vip_entry_price: Decimal.new("300.00"),
      dj_lineup: [],
      cover_image: nil,
      status: "draft",
      admin_id: admin.id
    }
  end

  # Trait for published event
  def published(event) do
    %{event | status: "published"}
  end

  # SpendingRecord factory
  def spending_record_factory do
    %Backend.Spending.SpendingRecord{
      id: Ecto.UUID.generate(),
      club: build(:club),
      user: build(:user),
      amount: Decimal.new("500.00"),
      visit_date: Date.utc_today(),
      notes: nil,
      group_outing_id: nil,
      paid_by_user_id: nil,
      split_type: nil,
      original_amount: nil,
      participant_ids: []
    }
  end

  # Trait for group spending
  def group_spending(spending_record) do
    %{spending_record | group_outing_id: Ecto.UUID.generate(), split_type: "equal"}
  end
end
