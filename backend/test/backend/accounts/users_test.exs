defmodule Backend.Accounts.UsersTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Accounts.Users
  alias Backend.Accounts.User

  describe "get_user_by/1" do
    test "returns user when found by id" do
      user = insert(:user)

      assert {:ok, found} = Users.get_user_by(id: user.id)
      assert found.id == user.id
      assert found.username == user.username
    end

    test "returns user when found by username" do
      user = insert(:user, username: "johndoe")

      assert {:ok, found} = Users.get_user_by(username: "johndoe")
      assert found.id == user.id
    end

    test "returns user when found by email" do
      user = insert(:user, email: "john@example.com")

      assert {:ok, found} = Users.get_user_by(email: "john@example.com")
      assert found.id == user.id
    end

    test "returns error when user not found" do
      assert {:error, :not_found} = Users.get_user_by(username: "nonexistent")
    end

    test "returns error when user not found by id" do
      assert {:error, :not_found} = Users.get_user_by(id: Ecto.UUID.generate())
    end
  end

  describe "update_profile/2" do
    test "updates profile fields successfully" do
      user = insert(:user)

      assert {:ok, updated} =
               Users.update_profile(user, %{
                 bio: "Love nightlife!",
                 favorite_drinks: ["mojito", "whiskey"]
               })

      assert updated.bio == "Love nightlife!"
      assert updated.favorite_drinks == ["mojito", "whiskey"]
    end

    test "updates location successfully" do
      user = insert(:user)

      location = %{
        "name" => "Johannesburg, South Africa",
        "latitude" => -26.2041,
        "longitude" => 28.0473
      }

      assert {:ok, updated} = Users.update_profile(user, %{location: location})
      assert updated.location["name"] == "Johannesburg, South Africa"
      assert updated.location["latitude"] == -26.2041
    end

    test "updates onboarding_complete flag" do
      user = insert(:user, onboarding_complete: false)

      assert {:ok, updated} = Users.update_profile(user, %{onboarding_complete: true})
      assert updated.onboarding_complete == true
    end

    test "validates bio length" do
      user = insert(:user)
      long_bio = String.duplicate("a", 501)

      assert {:error, changeset} = Users.update_profile(user, %{bio: long_bio})
      assert "should be at most 500 character(s)" in errors_on(changeset).bio
    end

    test "validates location must be a map" do
      user = insert(:user)

      assert {:error, changeset} = Users.update_profile(user, %{location: "invalid"})
      assert "is invalid" in errors_on(changeset).location
    end

    test "validates location must include name field" do
      user = insert(:user)

      assert {:error, changeset} =
               Users.update_profile(user, %{location: %{"latitude" => -33.9249}})

      assert "must include a name field" in errors_on(changeset).location
    end

    test "accepts empty array for favorite_drinks" do
      user = insert(:user, favorite_drinks: ["beer"])

      assert {:ok, updated} = Users.update_profile(user, %{favorite_drinks: []})
      assert updated.favorite_drinks == []
    end

    test "does not update username or email (use update_account_info)" do
      user = insert(:user, username: "original", email: "original@example.com")

      # profile_changeset doesn't include username/email
      {:ok, updated} =
        Users.update_profile(user, %{
          username: "changed",
          email: "changed@example.com",
          bio: "New bio"
        })

      assert updated.username == "original"
      assert updated.email == "original@example.com"
      assert updated.bio == "New bio"
    end
  end

  describe "update_account_info/2" do
    test "updates account fields successfully" do
      user = insert(:user)

      assert {:ok, updated} =
               Users.update_account_info(user, %{
                 username: "janesmith",
                 email: "jane@example.com",
                 phone: "+27 123 456 7890"
               })

      assert updated.username == "janesmith"
      assert updated.email == "jane@example.com"
      assert updated.phone == "+27 123 456 7890"
    end

    test "validates username length (min 3 chars)" do
      user = insert(:user)

      assert {:error, changeset} = Users.update_account_info(user, %{username: "ab"})
      assert "should be at least 3 character(s)" in errors_on(changeset).username
    end

    test "validates username length (max 50 chars)" do
      user = insert(:user)
      long_username = String.duplicate("a", 51)

      assert {:error, changeset} = Users.update_account_info(user, %{username: long_username})
      assert "should be at most 50 character(s)" in errors_on(changeset).username
    end

    test "validates email format" do
      user = insert(:user)

      assert {:error, changeset} = Users.update_account_info(user, %{email: "invalid"})
      assert "must be a valid email" in errors_on(changeset).email
    end

    test "returns error on duplicate username" do
      insert(:user, username: "taken")
      user = insert(:user, username: "original")

      assert {:error, changeset} = Users.update_account_info(user, %{username: "taken"})
      assert "username already taken" in errors_on(changeset).username
    end

    test "returns error on duplicate email" do
      insert(:user, email: "taken@example.com")
      user = insert(:user, email: "original@example.com")

      assert {:error, changeset} =
               Users.update_account_info(user, %{email: "taken@example.com"})

      assert "email already taken" in errors_on(changeset).email
    end

    test "allows same user to keep their own username" do
      user = insert(:user, username: "johndoe")

      # Update other fields but keep same username
      assert {:ok, updated} =
               Users.update_account_info(user, %{
                 username: "johndoe",
                 email: "newemail@example.com"
               })

      assert updated.username == "johndoe"
      assert updated.email == "newemail@example.com"
    end
  end

  describe "change_password/2" do
    test "changes password when current password is correct" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("oldpassword"))

      assert {:ok, updated} =
               Users.change_password(user, %{
                 "current_password" => "oldpassword",
                 "new_password" => "newpassword123"
               })

      # Verify old password no longer works
      assert {:error, :invalid_password} = Users.verify_password(updated, "oldpassword")
      # Verify new password works
      assert :ok = Users.verify_password(updated, "newpassword123")
    end

    test "returns error when current password is incorrect" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert {:error, :invalid_password} =
               Users.change_password(user, %{
                 "current_password" => "wrongpass",
                 "new_password" => "newpass123"
               })
    end

    test "validates new password length (min 6 chars)" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("oldpass"))

      assert {:error, changeset} =
               Users.change_password(user, %{
                 "current_password" => "oldpass",
                 "new_password" => "short"
               })

      assert "should be at least 6 character(s)" in errors_on(changeset).password
    end

    test "validates new password length (max 100 chars)" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("oldpass"))
      long_password = String.duplicate("a", 101)

      assert {:error, changeset} =
               Users.change_password(user, %{
                 "current_password" => "oldpass",
                 "new_password" => long_password
               })

      assert "should be at most 100 character(s)" in errors_on(changeset).password
    end

    test "returns error when params are invalid" do
      user = insert(:user)

      assert {:error, :invalid_params} = Users.change_password(user, %{})
      assert {:error, :invalid_params} = Users.change_password(user, %{"current_password" => "test"})

      assert {:error, :invalid_params} =
               Users.change_password(user, %{"new_password" => "test"})
    end
  end

  describe "verify_password/2" do
    test "returns :ok when password is correct" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert :ok = Users.verify_password(user, "correctpass")
    end

    test "returns error when password is incorrect" do
      user = insert(:user, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert {:error, :invalid_password} = Users.verify_password(user, "wrongpass")
    end
  end

  describe "search_users/2" do
    test "finds users by username (case-insensitive)" do
      insert(:user, username: "johndoe", role: "club_goer")
      insert(:user, username: "janedoe", role: "club_goer")
      insert(:user, username: "bobsmith", role: "club_goer")

      results = Users.search_users("john")
      assert length(results) == 1
      assert hd(results).username == "johndoe"
    end

    test "excludes specified user IDs" do
      user1 = insert(:user, username: "johndoe", role: "club_goer")
      user2 = insert(:user, username: "johnsmith", role: "club_goer")

      results = Users.search_users("john", exclude_ids: [user1.id])
      assert length(results) == 1
      assert hd(results).id == user2.id
    end

    test "respects limit parameter" do
      for i <- 1..15 do
        insert(:user, username: "testuser#{i}", role: "club_goer")
      end

      results = Users.search_users("testuser", limit: 5)
      assert length(results) == 5
    end

    test "defaults to limit of 10" do
      for i <- 1..15 do
        insert(:user, username: "testuser#{i}", role: "club_goer")
      end

      results = Users.search_users("testuser")
      assert length(results) == 10
    end

    test "only returns club_goers, not club_owners" do
      insert(:user, username: "goer1", role: "club_goer")
      insert(:user, username: "owner1", role: "club_owner")

      results = Users.search_users("1")
      assert length(results) == 1
      assert hd(results).username == "goer1"
    end

    test "returns only selected fields" do
      insert(:user, username: "johndoe", role: "club_goer")

      results = Users.search_users("john")
      user = hd(results)

      # Should have these fields
      assert user.id
      assert user.username

      # Should not load other fields (they will be struct fields but not loaded from DB)
      # Ecto structs always have all keys, but unselected fields will be nil
      assert is_nil(user.email)
      assert is_nil(user.password_hash)
      assert is_nil(user.bio)
    end

    test "returns empty list when no matches" do
      insert(:user, username: "johndoe", role: "club_goer")

      results = Users.search_users("nonexistent")
      assert results == []
    end

    test "finds partial matches" do
      insert(:user, username: "johnnyboy", role: "club_goer")

      results = Users.search_users("john")
      assert length(results) == 1
      assert hd(results).username == "johnnyboy"
    end
  end

  describe "update_last_seen/1" do
    test "updates last_seen_at timestamp" do
      user = insert(:user, last_seen_at: nil)

      assert {:ok, updated} = Users.update_last_seen(user.id)
      assert updated.last_seen_at != nil
      assert NaiveDateTime.compare(updated.last_seen_at, NaiveDateTime.utc_now()) in [:lt, :eq]
    end

    test "updates existing last_seen_at to new timestamp" do
      old_timestamp = ~N[2024-01-01 12:00:00]
      user = insert(:user, last_seen_at: old_timestamp)

      assert {:ok, updated} = Users.update_last_seen(user.id)
      assert NaiveDateTime.compare(updated.last_seen_at, old_timestamp) == :gt
    end

    test "returns error when user not found" do
      assert {:error, :not_found} = Users.update_last_seen(Ecto.UUID.generate())
    end
  end
end
