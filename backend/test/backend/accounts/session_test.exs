defmodule Backend.Accounts.SessionTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Accounts.Session

  describe "authenticate/1 with string keys" do
    test "returns user and JWT token with valid credentials" do
      user = insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:ok, %{user: returned_user, jwt: jwt}} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "password123"
               })

      assert returned_user.id == user.id
      assert returned_user.username == "johndoe"
      assert is_binary(jwt)
      assert String.length(jwt) > 0
    end

    test "returns error with invalid username" do
      insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "nonexistent",
                 "password" => "password123"
               })
    end

    test "returns error with invalid password" do
      insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "wrongpassword"
               })
    end

    test "returns error with empty username" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "",
                 "password" => "password123"
               })
    end

    test "returns error with empty password" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => ""
               })
    end
  end

  describe "authenticate/1 with atom keys" do
    test "returns user and JWT token with valid credentials" do
      user = insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:ok, %{user: returned_user, jwt: jwt}} =
               Session.authenticate(%{
                 username: "johndoe",
                 password: "password123"
               })

      assert returned_user.id == user.id
      assert returned_user.username == "johndoe"
      assert is_binary(jwt)
    end

    test "returns error with invalid username" do
      insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 username: "nonexistent",
                 password: "password123"
               })
    end

    test "returns error with invalid password" do
      insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 username: "johndoe",
                 password: "wrongpassword"
               })
    end
  end

  describe "authenticate/1 with invalid params" do
    test "returns error with missing username" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "password" => "password123"
               })
    end

    test "returns error with missing password" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe"
               })
    end

    test "returns error with empty map" do
      assert {:error, :invalid_credentials} = Session.authenticate(%{})
    end

    test "returns error with nil username" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => nil,
                 "password" => "password123"
               })
    end

    test "returns error with nil password" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => nil
               })
    end

    test "returns error with non-string username" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => 12345,
                 "password" => "password123"
               })
    end

    test "returns error with non-string password" do
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => 12345
               })
    end
  end

  describe "JWT token validation" do
    test "generated JWT can be decoded back to user" do
      user = insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      assert {:ok, %{jwt: jwt}} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "password123"
               })

      # Verify token can be decoded
      assert {:ok, claims} = Backend.Guardian.decode_and_verify(jwt)
      assert claims["sub"] == "User:#{user.id}"
    end

    test "JWT contains user ID in subject" do
      user = insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      {:ok, %{jwt: jwt}} =
        Session.authenticate(%{
          "username" => "johndoe",
          "password" => "password123"
        })

      {:ok, claims} = Backend.Guardian.decode_and_verify(jwt)
      assert String.starts_with?(claims["sub"], "User:")
      assert String.ends_with?(claims["sub"], user.id)
    end
  end

  describe "security tests" do
    test "does not leak user existence through different error messages" do
      insert(:user, username: "existinguser", password_hash: Bcrypt.hash_pwd_salt("password123"))

      # Wrong password for existing user
      error1 =
        Session.authenticate(%{
          "username" => "existinguser",
          "password" => "wrongpassword"
        })

      # Non-existent user
      error2 =
        Session.authenticate(%{
          "username" => "nonexistentuser",
          "password" => "anypassword"
        })

      # Both should return the same error to prevent username enumeration
      assert error1 == {:error, :invalid_credentials}
      assert error2 == {:error, :invalid_credentials}
    end

    test "password verification is case-sensitive" do
      insert(:user, username: "johndoe", password_hash: Bcrypt.hash_pwd_salt("Password123"))

      # Exact match - should work
      assert {:ok, _} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "Password123"
               })

      # Different case - should fail
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "password123"
               })
    end

    test "username lookup is case-sensitive" do
      insert(:user, username: "JohnDoe", password_hash: Bcrypt.hash_pwd_salt("password123"))

      # Exact match - should work
      assert {:ok, _} =
               Session.authenticate(%{
                 "username" => "JohnDoe",
                 "password" => "password123"
               })

      # Different case - should fail
      assert {:error, :invalid_credentials} =
               Session.authenticate(%{
                 "username" => "johndoe",
                 "password" => "password123"
               })
    end
  end
end
