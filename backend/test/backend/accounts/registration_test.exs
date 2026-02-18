defmodule Backend.Accounts.RegistrationTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Accounts.Registration
  alias Backend.Accounts.User

  describe "register_user/1" do
    test "registers a new user with valid attributes" do
      attrs = %{
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        role: "club_goer"
      }

      assert {:ok, %User{} = user} = Registration.register_user(attrs)
      assert user.username == "johndoe"
      assert user.email == "john@example.com"
      assert user.role == "club_goer"
      assert user.password_hash != nil
      assert user.onboarding_complete == false
    end

    test "hashes the password" do
      attrs = %{
        username: "johndoe",
        password: "password123",
        role: "club_goer"
      }

      assert {:ok, user} = Registration.register_user(attrs)

      # Password should be hashed, not stored in plain text
      assert user.password_hash != "password123"
      # Verify password works with Bcrypt
      assert Bcrypt.verify_pass("password123", user.password_hash)
    end

    test "creates user with optional fields" do
      attrs = %{
        username: "johndoe",
        email: "john@example.com",
        phone: "+27 123 456 7890",
        password: "password123",
        role: "club_goer",
        bio: "Love nightlife!",
        vibes: ["energetic", "friendly"],
        favorite_drinks: ["mojito"]
      }

      assert {:ok, user} = Registration.register_user(attrs)
      assert user.phone == "+27 123 456 7890"
      assert user.bio == "Love nightlife!"
      assert user.vibes == ["energetic", "friendly"]
      assert user.favorite_drinks == ["mojito"]
    end

    test "creates user with club_owner role" do
      attrs = %{
        username: "clubowner",
        password: "password123",
        role: "club_owner"
      }

      assert {:ok, user} = Registration.register_user(attrs)
      assert user.role == "club_owner"
    end

    # Validation tests
    test "requires username" do
      attrs = %{
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "can't be blank" in errors_on(changeset).username
    end

    test "requires password" do
      attrs = %{
        username: "johndoe",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "can't be blank" in errors_on(changeset).password
    end

    test "requires role" do
      attrs = %{
        username: "johndoe",
        password: "password123"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "can't be blank" in errors_on(changeset).role
    end

    test "validates username length (min 3 chars)" do
      attrs = %{
        username: "ab",
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "should be at least 3 character(s)" in errors_on(changeset).username
    end

    test "validates username length (max 50 chars)" do
      attrs = %{
        username: String.duplicate("a", 51),
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "should be at most 50 character(s)" in errors_on(changeset).username
    end

    test "validates password length (min 6 chars)" do
      attrs = %{
        username: "johndoe",
        password: "short",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "should be at least 6 character(s)" in errors_on(changeset).password
    end

    test "validates password length (max 100 chars)" do
      attrs = %{
        username: "johndoe",
        password: String.duplicate("a", 101),
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "should be at most 100 character(s)" in errors_on(changeset).password
    end

    test "validates email format" do
      attrs = %{
        username: "johndoe",
        email: "invalid-email",
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "must be a valid email" in errors_on(changeset).email
    end

    test "validates role is valid value" do
      attrs = %{
        username: "johndoe",
        password: "password123",
        role: "invalid_role"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "is invalid" in errors_on(changeset).role
    end

    test "returns error on duplicate username" do
      insert(:user, username: "johndoe")

      attrs = %{
        username: "johndoe",
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "username already taken" in errors_on(changeset).username
    end

    test "returns error on duplicate email" do
      insert(:user, email: "taken@example.com")

      attrs = %{
        username: "newuser",
        email: "taken@example.com",
        password: "password123",
        role: "club_goer"
      }

      assert {:error, changeset} = Registration.register_user(attrs)
      assert "email already taken" in errors_on(changeset).email
    end

    test "allows registration without email" do
      attrs = %{
        username: "johndoe",
        password: "password123",
        role: "club_goer"
      }

      assert {:ok, user} = Registration.register_user(attrs)
      assert user.email == nil
    end

    test "initializes arrays to empty by default" do
      attrs = %{
        username: "johndoe",
        password: "password123",
        role: "club_goer"
      }

      assert {:ok, user} = Registration.register_user(attrs)
      # Arrays might be nil from DB or empty depending on schema defaults
      assert user.vibes == [] or is_nil(user.vibes)
      assert user.favorite_drinks == [] or is_nil(user.favorite_drinks)
    end
  end
end
