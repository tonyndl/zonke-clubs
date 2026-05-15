defmodule Backend.IntentionsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Intentions

  describe "create_intention/1" do
    test "creates an intention with valid attributes" do
      user = insert(:user)
      club = insert(:club)

      attrs = %{
        user_id: user.id,
        club_id: club.id,
        activity_type: "new_friends",
        planned_date: Date.add(Date.utc_today(), 1),
        active: true
      }

      assert {:ok, intention} = Intentions.create_intention(attrs)
      assert intention.activity_type == "new_friends"
      assert intention.user_id == user.id
      assert intention.club_id == club.id
    end

    test "accepts all valid activity types" do
      user = insert(:user)

      for type <- ["dancing_partner", "drinking_buddy", "new_friends", "open_to_anything"] do
        club = insert(:club)
        attrs = %{
          user_id: user.id,
          club_id: club.id,
          activity_type: type,
          planned_date: Date.add(Date.utc_today(), 1),
          active: true
        }
        assert {:ok, intention} = Intentions.create_intention(attrs)
        assert intention.activity_type == type
      end
    end

    test "returns error for invalid activity type" do
      user = insert(:user)
      club = insert(:club)

      attrs = %{
        user_id: user.id,
        club_id: club.id,
        activity_type: "partying",
        planned_date: Date.add(Date.utc_today(), 1),
        active: true
      }

      assert {:error, changeset} = Intentions.create_intention(attrs)
      assert "is invalid" in errors_on(changeset).activity_type
    end

    test "upserts when same user/club/date combination exists" do
      user = insert(:user)
      club = insert(:club)
      date = Date.add(Date.utc_today(), 1)

      base_attrs = %{user_id: user.id, club_id: club.id, planned_date: date, active: true}

      {:ok, _} = Intentions.create_intention(Map.put(base_attrs, :activity_type, "new_friends"))
      {:ok, updated} = Intentions.create_intention(Map.put(base_attrs, :activity_type, "drinking_buddy"))

      assert updated.activity_type == "drinking_buddy"
      assert length(Intentions.list_user_intentions(user.id)) == 1
    end

    test "requires activity_type, club_id, user_id, planned_date" do
      assert {:error, changeset} = Intentions.create_intention(%{})
      errors = errors_on(changeset)
      assert "can't be blank" in errors.activity_type
      assert "can't be blank" in errors.club_id
      assert "can't be blank" in errors.user_id
      assert "can't be blank" in errors.planned_date
    end
  end

  describe "get_intention/1" do
    test "returns intention with preloaded user" do
      intention = insert(:intention)
      assert {:ok, found} = Intentions.get_intention(intention.id)
      assert found.id == intention.id
      assert found.user != nil
    end

    test "returns error for non-existent ID" do
      assert {:error, :not_found} = Intentions.get_intention(Ecto.UUID.generate())
    end
  end

  describe "update_intention/2" do
    test "updates the intention" do
      intention = insert(:intention, activity_type: "new_friends")
      assert {:ok, updated} = Intentions.update_intention(intention, %{activity_type: "drinking_buddy"})
      assert updated.activity_type == "drinking_buddy"
    end

    test "returns error for invalid update" do
      intention = insert(:intention)
      assert {:error, changeset} = Intentions.update_intention(intention, %{activity_type: "invalid"})
      assert "is invalid" in errors_on(changeset).activity_type
    end
  end

  describe "delete_intention/1" do
    test "deletes the intention" do
      intention = insert(:intention)
      assert {:ok, _} = Intentions.delete_intention(intention)
      assert {:error, :not_found} = Intentions.get_intention(intention.id)
    end
  end

  describe "list_club_intentions/2" do
    test "returns active future intentions for a club" do
      club = insert(:club)
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 1), active: true)
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 2), active: true)

      intentions = Intentions.list_club_intentions(club.id)
      assert length(intentions) == 2
    end

    test "excludes past intentions" do
      club = insert(:club)
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), -1), active: true)

      assert Intentions.list_club_intentions(club.id) == []
    end

    test "excludes inactive intentions" do
      club = insert(:club)
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 1), active: false)

      assert Intentions.list_club_intentions(club.id) == []
    end

    test "excludes intentions from other clubs" do
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:intention, club: club1, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, club: club2, planned_date: Date.add(Date.utc_today(), 1))

      assert length(Intentions.list_club_intentions(club1.id)) == 1
    end

    test "excludes specified user's intentions" do
      club = insert(:club)
      user = insert(:user)
      insert(:intention, club: club, user: user, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 1))

      intentions = Intentions.list_club_intentions(club.id, user.id)
      assert length(intentions) == 1
      assert hd(intentions).user_id != user.id
    end

    test "returns intentions with preloaded user" do
      club = insert(:club)
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 1))

      [intention] = Intentions.list_club_intentions(club.id)
      assert intention.user != nil
    end
  end

  describe "list_all_intentions/1" do
    test "returns all active future intentions across clubs" do
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:intention, club: club1, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, club: club2, planned_date: Date.add(Date.utc_today(), 1))

      intentions = Intentions.list_all_intentions()
      assert length(intentions) >= 2
    end

    test "excludes past intentions" do
      user = insert(:user)
      club = insert(:club)
      insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), -1))

      intentions = Intentions.list_all_intentions()
      refute Enum.any?(intentions, &(&1.user_id == user.id))
    end

    test "excludes specified user's intentions" do
      user = insert(:user)
      club = insert(:club)
      insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, club: club, planned_date: Date.add(Date.utc_today(), 1))

      intentions = Intentions.list_all_intentions(user.id)
      refute Enum.any?(intentions, &(&1.user_id == user.id))
    end
  end

  describe "list_user_intentions/1" do
    test "returns all active future intentions for a user" do
      user = insert(:user)
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:intention, user: user, club: club1, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, user: user, club: club2, planned_date: Date.add(Date.utc_today(), 3))

      intentions = Intentions.list_user_intentions(user.id)
      assert length(intentions) == 2
      assert Enum.all?(intentions, &(&1.user_id == user.id))
    end

    test "returns intentions ordered by planned_date ascending" do
      user = insert(:user)
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:intention, user: user, club: club1, planned_date: Date.add(Date.utc_today(), 5))
      insert(:intention, user: user, club: club2, planned_date: Date.add(Date.utc_today(), 2))

      intentions = Intentions.list_user_intentions(user.id)
      dates = Enum.map(intentions, & &1.planned_date)
      assert dates == Enum.sort(dates, &(Date.compare(&1, &2) != :gt))
    end

    test "excludes past intentions" do
      user = insert(:user)
      club = insert(:club)
      insert(:intention, user: user, club: club, planned_date: Date.add(Date.utc_today(), -1))

      assert Intentions.list_user_intentions(user.id) == []
    end

    test "does not return other users' intentions" do
      user1 = insert(:user)
      user2 = insert(:user)
      club = insert(:club)
      insert(:intention, user: user1, club: club, planned_date: Date.add(Date.utc_today(), 1))
      insert(:intention, user: user2, club: club, planned_date: Date.add(Date.utc_today(), 1))

      intentions = Intentions.list_user_intentions(user1.id)
      assert length(intentions) == 1
    end
  end
end
