defmodule Backend.ClubsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Clubs

  describe "create_club/1" do
    test "creates club with valid attributes (user-owned)" do
      user = insert(:user)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{
          "name" => "Cape Town, South Africa",
          "latitude" => -33.9249,
          "longitude" => 18.4241
        },
        "user_id" => user.id
      }

      assert {:ok, club} = Clubs.create_club(attrs)
      assert club.name == "The Night Owl"
      assert club.user_id == user.id
      assert is_nil(club.admin_id)
      assert club.active == true
    end

    test "creates club with valid attributes (admin-owned)" do
      admin = insert(:admin)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{
          "name" => "Cape Town, South Africa",
          "latitude" => -33.9249,
          "longitude" => 18.4241
        },
        "admin_id" => admin.id
      }

      assert {:ok, club} = Clubs.create_club(attrs)
      assert club.name == "The Night Owl"
      assert club.admin_id == admin.id
      assert is_nil(club.user_id)
    end

    test "creates club with optional fields" do
      user = insert(:user)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{"name" => "Cape Town"},
        "user_id" => user.id,
        "email" => "info@nightowl.com",
        "phone" => "+27123456789",
        "dress_code" => "Smart casual",
        "entry_fee" => "R200",
        "opening_hours" => %{
          "friday" => %{"open" => "22:00", "close" => "04:00"},
          "saturday" => %{"open" => "22:00", "close" => "04:00"}
        }
      }

      assert {:ok, club} = Clubs.create_club(attrs)
      assert club.email == "info@nightowl.com"
      assert club.opening_hours["friday"]["open"] == "22:00"
    end

    test "validates required fields" do
      user = insert(:user)

      assert {:error, changeset} = Clubs.create_club(%{"user_id" => user.id})
      assert "can't be blank" in errors_on(changeset).name
      assert "can't be blank" in errors_on(changeset).description
      assert "can't be blank" in errors_on(changeset).location
    end

    test "validates location is a map" do
      user = insert(:user)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => "Cape Town",
        "user_id" => user.id
      }

      assert {:error, changeset} = Clubs.create_club(attrs)
      # Ecto cast returns "is invalid" when it can't cast a string to a map
      assert "is invalid" in errors_on(changeset).location
    end

    test "validates location has name field" do
      user = insert(:user)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{"latitude" => -33.9249, "longitude" => 18.4241},
        "user_id" => user.id
      }

      assert {:error, changeset} = Clubs.create_club(attrs)
      assert "must include a name field" in errors_on(changeset).location
    end

    test "validates club must have either user_id or admin_id" do
      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{"name" => "Cape Town"}
      }

      assert {:error, changeset} = Clubs.create_club(attrs)
      assert "Club must have either a user or admin owner" in errors_on(changeset).base
    end

    test "validates club cannot have both user_id and admin_id" do
      user = insert(:user)
      admin = insert(:admin)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{"name" => "Cape Town"},
        "user_id" => user.id,
        "admin_id" => admin.id
      }

      assert {:error, changeset} = Clubs.create_club(attrs)
      assert "Club cannot have both user and admin owners" in errors_on(changeset).base
    end

    test "validates unique club name" do
      user = insert(:user)
      insert(:club, name: "The Night Owl")

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Another club",
        "location" => %{"name" => "Cape Town"},
        "user_id" => user.id
      }

      assert {:error, changeset} = Clubs.create_club(attrs)
      assert "has already been taken" in errors_on(changeset).name
    end
  end

  describe "list_clubs/0" do
    test "returns all active clubs ordered by name" do
      club1 = insert(:club, name: "Zebra Lounge", active: true)
      club2 = insert(:club, name: "Alpha Club", active: true)
      club3 = insert(:club, name: "Beta Bar", active: true)
      _inactive = insert(:club, name: "Closed Club", active: false)

      clubs = Clubs.list_clubs()

      # Should only return active clubs, ordered by name
      assert length(clubs) == 3
      assert Enum.map(clubs, & &1.name) == ["Alpha Club", "Beta Bar", "Zebra Lounge"]
    end

    test "returns empty list when no active clubs" do
      insert(:club, active: false)

      assert Clubs.list_clubs() == []
    end
  end

  describe "get_club/1" do
    test "returns club when found" do
      club = insert(:club)

      assert {:ok, found} = Clubs.get_club(club.id)
      assert found.id == club.id
      assert found.name == club.name
    end

    test "returns error when club not found" do
      assert {:error, :not_found} = Clubs.get_club(Ecto.UUID.generate())
    end

    test "returns inactive clubs" do
      club = insert(:club, active: false)

      assert {:ok, found} = Clubs.get_club(club.id)
      assert found.id == club.id
    end
  end

  describe "update_club/2" do
    test "updates club with valid attributes" do
      club = insert(:club, name: "Old Name")

      assert {:ok, updated} = Clubs.update_club(club, %{"name" => "New Name"})
      assert updated.name == "New Name"
    end

    test "validates on update" do
      club = insert(:club)

      assert {:error, changeset} = Clubs.update_club(club, %{"name" => ""})
      assert "can't be blank" in errors_on(changeset).name
    end

    test "can deactivate club" do
      club = insert(:club, active: true)

      assert {:ok, updated} = Clubs.update_club(club, %{"active" => false})
      assert updated.active == false
    end

    test "can update opening_hours" do
      club = insert(:club, opening_hours: %{})

      new_hours = %{
        "friday" => %{"open" => "22:00", "close" => "04:00"}
      }

      assert {:ok, updated} = Clubs.update_club(club, %{"opening_hours" => new_hours})
      assert updated.opening_hours["friday"]["open"] == "22:00"
    end
  end

  describe "delete_club/1" do
    test "deletes club" do
      club = insert(:club)

      assert {:ok, deleted} = Clubs.delete_club(club)
      assert deleted.id == club.id
      assert {:error, :not_found} = Clubs.get_club(club.id)
    end
  end

  describe "get_admin_club/1" do
    test "returns club when admin has one" do
      admin = insert(:admin)
      club = insert(:club, user_id: nil, admin_id: admin.id)

      assert {:ok, found} = Clubs.get_admin_club(admin.id)
      assert found.id == club.id
    end

    test "returns error when admin has no club" do
      admin = insert(:admin)

      assert {:error, :not_found} = Clubs.get_admin_club(admin.id)
    end

    test "returns only club owned by specific admin" do
      admin1 = insert(:admin)
      admin2 = insert(:admin)
      club1 = insert(:club, user_id: nil, admin_id: admin1.id)
      _club2 = insert(:club, user_id: nil, admin_id: admin2.id)

      assert {:ok, found} = Clubs.get_admin_club(admin1.id)
      assert found.id == club1.id
    end
  end

  describe "setup_admin_club/2" do
    test "creates new club when admin has none" do
      admin = insert(:admin)

      attrs = %{
        "name" => "The Night Owl",
        "description" => "Best nightclub in Cape Town",
        "location" => %{"name" => "Cape Town"}
      }

      assert {:ok, club} = Clubs.setup_admin_club(admin.id, attrs)
      assert club.name == "The Night Owl"
      assert club.admin_id == admin.id
      assert is_nil(club.user_id)
    end

    test "updates existing club when admin already has one" do
      admin = insert(:admin)
      club = insert(:club, user_id: nil, admin_id: admin.id, name: "Old Name")

      attrs = %{"name" => "New Name"}

      assert {:ok, updated} = Clubs.setup_admin_club(admin.id, attrs)
      assert updated.id == club.id
      assert updated.name == "New Name"
    end

    test "can update opening_hours on existing club" do
      admin = insert(:admin)
      club = insert(:club, user_id: nil, admin_id: admin.id, opening_hours: %{})

      new_hours = %{
        "friday" => %{"open" => "22:00", "close" => "04:00"}
      }

      assert {:ok, updated} = Clubs.setup_admin_club(admin.id, %{"opening_hours" => new_hours})
      assert updated.id == club.id
      assert updated.opening_hours["friday"]["open"] == "22:00"
    end
  end

  describe "like_club/2" do
    test "creates club like when not already liked" do
      user = insert(:user)
      club = insert(:club)

      assert {:ok, club_like} = Clubs.like_club(club.id, user)
      assert club_like.user_id == user.id
      assert club_like.club_id == club.id
    end

    test "is idempotent - returns success when already liked" do
      user = insert(:user)
      club = insert(:club)

      # Like first time
      assert {:ok, first_like} = Clubs.like_club(club.id, user)

      # Like again
      assert {:ok, second_like} = Clubs.like_club(club.id, user)

      # Should return the same like
      assert first_like.id == second_like.id
    end

    test "different users can like the same club" do
      user1 = insert(:user)
      user2 = insert(:user)
      club = insert(:club)

      assert {:ok, like1} = Clubs.like_club(club.id, user1)
      assert {:ok, like2} = Clubs.like_club(club.id, user2)

      assert like1.user_id == user1.id
      assert like2.user_id == user2.id
      assert like1.club_id == like2.club_id
    end
  end

  describe "unlike_club/2" do
    test "deletes club like when liked" do
      user = insert(:user)
      club = insert(:club)
      insert(:club_like, user: user, club: club)

      assert {:ok, deleted} = Clubs.unlike_club(club.id, user)
      assert deleted.user_id == user.id
      assert deleted.club_id == club.id

      # Verify it's gone
      assert {:error, :not_found} = Clubs.unlike_club(club.id, user)
    end

    test "returns error when not liked" do
      user = insert(:user)
      club = insert(:club)

      assert {:error, :not_found} = Clubs.unlike_club(club.id, user)
    end

    test "only deletes like for specific user" do
      user1 = insert(:user)
      user2 = insert(:user)
      club = insert(:club)

      insert(:club_like, user: user1, club: club)
      insert(:club_like, user: user2, club: club)

      assert {:ok, _} = Clubs.unlike_club(club.id, user1)

      # User2's like should still exist
      assert Clubs.is_club_liked?(club.id, user2) == true
    end
  end

  describe "is_club_liked?/2" do
    test "returns true when club is liked" do
      user = insert(:user)
      club = insert(:club)
      insert(:club_like, user: user, club: club)

      assert Clubs.is_club_liked?(club.id, user) == true
    end

    test "returns false when club is not liked" do
      user = insert(:user)
      club = insert(:club)

      assert Clubs.is_club_liked?(club.id, user) == false
    end

    test "returns false when session is nil" do
      club = insert(:club)

      assert Clubs.is_club_liked?(club.id, nil) == false
    end
  end

  describe "get_club_favorites_count/1" do
    test "returns count of users who favorited club" do
      club = insert(:club)
      user1 = insert(:user)
      user2 = insert(:user)
      user3 = insert(:user)

      insert(:club_like, user: user1, club: club)
      insert(:club_like, user: user2, club: club)
      insert(:club_like, user: user3, club: club)

      assert Clubs.get_club_favorites_count(club.id) == 3
    end

    test "returns 0 when no favorites" do
      club = insert(:club)

      assert Clubs.get_club_favorites_count(club.id) == 0
    end

    test "only counts likes for specific club" do
      club1 = insert(:club)
      club2 = insert(:club)
      user = insert(:user)

      insert(:club_like, user: user, club: club1)
      insert(:club_like, user: user, club: club2)

      assert Clubs.get_club_favorites_count(club1.id) == 1
    end
  end

  describe "get_user_favorite_clubs/1" do
    test "returns clubs liked by user" do
      user = insert(:user)
      club1 = insert(:club, name: "Club One")
      club2 = insert(:club, name: "Club Two")
      _club3 = insert(:club, name: "Club Three")

      insert(:club_like, user: user, club: club1)
      insert(:club_like, user: user, club: club2)

      favorites = Clubs.get_user_favorite_clubs(user)

      assert length(favorites) == 2
      favorite_ids = Enum.map(favorites, & &1.id) |> MapSet.new()
      assert MapSet.member?(favorite_ids, club1.id)
      assert MapSet.member?(favorite_ids, club2.id)
    end

    test "orders by when liked (most recent first)" do
      user = insert(:user)

      # Insert in specific order with slight time difference
      club1 = insert(:club)
      like1 = insert(:club_like, user: user, club: club1)

      Process.sleep(10)

      club2 = insert(:club)
      like2 = insert(:club_like, user: user, club: club2)

      Process.sleep(10)

      club3 = insert(:club)
      like3 = insert(:club_like, user: user, club: club3)

      favorites = Clubs.get_user_favorite_clubs(user)

      # Most recent like should be first
      assert Enum.map(favorites, & &1.id) == [club3.id, club2.id, club1.id]
    end

    test "only returns active clubs" do
      user = insert(:user)
      active_club = insert(:club, active: true)
      inactive_club = insert(:club, active: false)

      insert(:club_like, user: user, club: active_club)
      insert(:club_like, user: user, club: inactive_club)

      favorites = Clubs.get_user_favorite_clubs(user)

      assert length(favorites) == 1
      assert hd(favorites).id == active_club.id
    end

    test "returns empty list when session is nil" do
      assert Clubs.get_user_favorite_clubs(nil) == []
    end

    test "returns empty list when user has no favorites" do
      user = insert(:user)

      assert Clubs.get_user_favorite_clubs(user) == []
    end
  end

  describe "list_clubs_with_likes/1" do
    test "returns clubs with is_liked flag when session provided" do
      user = insert(:user)
      liked_club = insert(:club, name: "Liked Club")
      not_liked_club = insert(:club, name: "Not Liked Club")

      insert(:club_like, user: user, club: liked_club)

      clubs = Clubs.list_clubs_with_likes(user)

      liked = Enum.find(clubs, &(&1.id == liked_club.id))
      not_liked = Enum.find(clubs, &(&1.id == not_liked_club.id))

      assert liked.is_liked == true
      assert not_liked.is_liked == false
    end

    test "returns all clubs when session is nil" do
      club1 = insert(:club)
      club2 = insert(:club)

      clubs = Clubs.list_clubs_with_likes(nil)

      assert length(clubs) == 2
      assert Enum.all?(clubs, &is_nil(&1.is_liked))
    end

    test "only returns active clubs" do
      user = insert(:user)
      _active_club = insert(:club, active: true)
      _inactive_club = insert(:club, active: false)

      clubs = Clubs.list_clubs_with_likes(user)

      assert length(clubs) == 1
    end
  end
end
