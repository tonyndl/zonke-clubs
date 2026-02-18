defmodule Backend.Admin.RegistrationTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Admin.Registration
  alias Backend.Admin.Admin

  describe "register_admin/1" do
    test "registers a new admin with valid attributes" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:ok, %Admin{} = admin} = Registration.register_admin(attrs)
      assert admin.email == "admin@example.com"
      assert admin.name == "Admin User"
      assert admin.role == "club_admin"
      assert admin.password_hash != nil
      assert admin.active == true
    end

    test "registers super_admin" do
      attrs = %{
        email: "super@example.com",
        name: "Super Admin",
        password: "securepass123",
        role: "super_admin"
      }

      assert {:ok, admin} = Registration.register_admin(attrs)
      assert admin.role == "super_admin"
    end

    test "hashes the password" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:ok, admin} = Registration.register_admin(attrs)

      # Password should be hashed, not stored in plain text
      assert admin.password_hash != "securepass123"
      # Verify password works with Bcrypt
      assert Bcrypt.verify_pass("securepass123", admin.password_hash)
    end

    test "creates admin with optional fields" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "securepass123",
        role: "club_admin",
        phone: "+27 123 456 789",
        avatar_url: "https://example.com/avatar.jpg"
      }

      assert {:ok, admin} = Registration.register_admin(attrs)
      assert admin.phone == "+27 123 456 789"
      assert admin.avatar_url == "https://example.com/avatar.jpg"
    end

    # Validation tests
    test "requires email" do
      attrs = %{
        name: "Admin User",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "can't be blank" in errors_on(changeset).email
    end

    test "requires name" do
      attrs = %{
        email: "admin@example.com",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "can't be blank" in errors_on(changeset).name
    end

    test "requires password" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "can't be blank" in errors_on(changeset).password
    end

    test "requires role" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "securepass123"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "can't be blank" in errors_on(changeset).role
    end

    test "validates email format" do
      attrs = %{
        email: "invalid-email",
        name: "Admin User",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "must be a valid email" in errors_on(changeset).email
    end

    test "validates name length (min 2)" do
      attrs = %{
        email: "admin@example.com",
        name: "A",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "should be at least 2 character(s)" in errors_on(changeset).name
    end

    test "validates name length (max 100)" do
      attrs = %{
        email: "admin@example.com",
        name: String.duplicate("a", 101),
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "should be at most 100 character(s)" in errors_on(changeset).name
    end

    test "validates password length (min 8)" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "short",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "should be at least 8 character(s)" in errors_on(changeset).password
    end

    test "validates password length (max 100)" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: String.duplicate("a", 101),
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "should be at most 100 character(s)" in errors_on(changeset).password
    end

    test "validates role is valid value" do
      attrs = %{
        email: "admin@example.com",
        name: "Admin User",
        password: "securepass123",
        role: "invalid_role"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "is invalid" in errors_on(changeset).role
    end

    test "returns error on duplicate email" do
      insert(:admin, email: "taken@example.com")

      attrs = %{
        email: "taken@example.com",
        name: "Another Admin",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:error, changeset} = Registration.register_admin(attrs)
      assert "email already taken" in errors_on(changeset).email
    end

    test "allows different admins with different emails" do
      insert(:admin, email: "admin1@example.com")

      attrs = %{
        email: "admin2@example.com",
        name: "Admin Two",
        password: "securepass123",
        role: "club_admin"
      }

      assert {:ok, _admin} = Registration.register_admin(attrs)
    end
  end
end
