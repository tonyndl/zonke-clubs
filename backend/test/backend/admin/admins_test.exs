defmodule Backend.Admin.AdminsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Admin.Admins

  describe "get_admin_by/1" do
    test "returns admin when found by id" do
      admin = insert(:admin)

      assert {:ok, found} = Admins.get_admin_by(id: admin.id)
      assert found.id == admin.id
      assert found.email == admin.email
    end

    test "returns admin when found by email" do
      admin = insert(:admin, email: "admin@example.com")

      assert {:ok, found} = Admins.get_admin_by(email: "admin@example.com")
      assert found.id == admin.id
    end

    test "returns error when admin not found" do
      assert {:error, :not_found} = Admins.get_admin_by(email: "nonexistent@example.com")
    end

    test "returns error when admin not found by id" do
      assert {:error, :not_found} = Admins.get_admin_by(id: Ecto.UUID.generate())
    end
  end

  describe "update_profile/2" do
    test "updates profile fields successfully" do
      admin = insert(:admin)

      assert {:ok, updated} =
               Admins.update_profile(admin, %{
                 name: "Updated Name",
                 phone: "+27 123 456 789",
                 avatar_url: "https://example.com/avatar.jpg"
               })

      assert updated.name == "Updated Name"
      assert updated.phone == "+27 123 456 789"
      assert updated.avatar_url == "https://example.com/avatar.jpg"
    end

    test "updates email successfully" do
      admin = insert(:admin, email: "old@example.com")

      assert {:ok, updated} = Admins.update_profile(admin, %{email: "new@example.com"})
      assert updated.email == "new@example.com"
    end

    test "updates role successfully" do
      admin = insert(:admin, role: "club_admin")

      assert {:ok, updated} = Admins.update_profile(admin, %{role: "super_admin"})
      assert updated.role == "super_admin"
    end

    test "updates active status" do
      admin = insert(:admin, active: true)

      assert {:ok, updated} = Admins.update_profile(admin, %{active: false})
      assert updated.active == false
    end

    test "validates name length" do
      admin = insert(:admin)
      long_name = String.duplicate("a", 101)

      assert {:error, changeset} = Admins.update_profile(admin, %{name: long_name})
      assert "should be at most 100 character(s)" in errors_on(changeset).name
    end

    test "validates email format" do
      admin = insert(:admin)

      assert {:error, changeset} = Admins.update_profile(admin, %{email: "invalid"})
      assert "must be a valid email" in errors_on(changeset).email
    end

    test "validates role is valid value" do
      admin = insert(:admin)

      assert {:error, changeset} = Admins.update_profile(admin, %{role: "invalid_role"})
      assert "is invalid" in errors_on(changeset).role
    end

    test "returns error on duplicate email" do
      insert(:admin, email: "taken@example.com")
      admin = insert(:admin, email: "original@example.com")

      assert {:error, changeset} = Admins.update_profile(admin, %{email: "taken@example.com"})
      assert "email already taken" in errors_on(changeset).email
    end

    test "allows same admin to keep their own email" do
      admin = insert(:admin, email: "admin@example.com")

      # Update other fields but keep same email
      assert {:ok, updated} =
               Admins.update_profile(admin, %{
                 email: "admin@example.com",
                 name: "Updated Name"
               })

      assert updated.email == "admin@example.com"
      assert updated.name == "Updated Name"
    end

    test "does not update password (use change_password)" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("oldpass"))
      original_hash = admin.password_hash

      # Attempting to update password through profile should be ignored
      {:ok, updated} = Admins.update_profile(admin, %{password: "newpass"})

      # Password hash should remain the same
      assert updated.password_hash == original_hash
    end
  end

  describe "change_password/2" do
    test "changes password when current password is correct" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("oldpassword"))

      assert {:ok, updated} =
               Admins.change_password(admin, %{
                 "current_password" => "oldpassword",
                 "new_password" => "newpassword123"
               })

      # Verify old password no longer works
      assert {:error, :invalid_password} = Admins.verify_password(updated, "oldpassword")
      # Verify new password works
      assert :ok = Admins.verify_password(updated, "newpassword123")
    end

    test "returns error when current password is incorrect" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert {:error, :invalid_password} =
               Admins.change_password(admin, %{
                 "current_password" => "wrongpass",
                 "new_password" => "newpass123"
               })
    end

    test "validates new password length (min 8)" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("oldpass"))

      assert {:error, changeset} =
               Admins.change_password(admin, %{
                 "current_password" => "oldpass",
                 "new_password" => "short"
               })

      assert "should be at least 8 character(s)" in errors_on(changeset).password
    end

    test "validates new password length (max 100)" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("oldpass"))
      long_password = String.duplicate("a", 101)

      assert {:error, changeset} =
               Admins.change_password(admin, %{
                 "current_password" => "oldpass",
                 "new_password" => long_password
               })

      assert "should be at most 100 character(s)" in errors_on(changeset).password
    end

    test "returns error when params are invalid" do
      admin = insert(:admin)

      assert {:error, :invalid_params} = Admins.change_password(admin, %{})
      assert {:error, :invalid_params} = Admins.change_password(admin, %{"current_password" => "test"})

      assert {:error, :invalid_params} =
               Admins.change_password(admin, %{"new_password" => "test"})
    end
  end

  describe "verify_password/2" do
    test "returns :ok when password is correct" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert :ok = Admins.verify_password(admin, "correctpass")
    end

    test "returns error when password is incorrect" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("correctpass"))

      assert {:error, :invalid_password} = Admins.verify_password(admin, "wrongpass")
    end
  end

  describe "check_active/1" do
    test "returns :ok for active admin" do
      admin = insert(:admin, active: true)

      assert :ok = Admins.check_active(admin)
    end

    test "returns error for inactive admin" do
      admin = insert(:admin, active: false)

      assert {:error, :account_inactive} = Admins.check_active(admin)
    end
  end
end
