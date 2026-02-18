defmodule Backend.Admin.SessionTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Admin.Session

  describe "authenticate/1" do
    setup do
      admin = insert(:admin, email: "admin@example.com", password_hash: Bcrypt.hash_pwd_salt("correctpass"))
      %{admin: admin}
    end

    test "authenticates admin with correct credentials (string keys)", %{admin: admin} do
      params = %{"email" => "admin@example.com", "password" => "correctpass"}

      assert {:ok, %{admin: returned_admin, jwt: jwt}} = Session.authenticate(params)
      assert returned_admin.id == admin.id
      assert is_binary(jwt)
      assert String.length(jwt) > 0
    end

    test "authenticates admin with correct credentials (atom keys)", %{admin: admin} do
      params = %{email: "admin@example.com", password: "correctpass"}

      assert {:ok, %{admin: returned_admin, jwt: jwt}} = Session.authenticate(params)
      assert returned_admin.id == admin.id
      assert is_binary(jwt)
    end

    test "returns error for incorrect password" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("correctpass"))
      params = %{"email" => admin.email, "password" => "wrongpass"}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "returns error for non-existent email" do
      params = %{"email" => "nonexistent@example.com", "password" => "anypassword"}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "returns error for inactive admin account" do
      admin = insert(:admin, password_hash: Bcrypt.hash_pwd_salt("correctpass"), active: false)
      params = %{"email" => admin.email, "password" => "correctpass"}

      assert {:error, :account_inactive} = Session.authenticate(params)
    end

    test "returns error for missing email" do
      params = %{"password" => "somepassword"}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "returns error for missing password" do
      params = %{"email" => "admin@example.com"}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "returns error for empty params" do
      assert {:error, :invalid_credentials} = Session.authenticate(%{})
    end

    test "returns error for non-string email" do
      params = %{email: 123, password: "password"}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "returns error for non-string password" do
      params = %{email: "admin@example.com", password: 123}

      assert {:error, :invalid_credentials} = Session.authenticate(params)
    end

    test "JWT contains admin role claim", %{admin: _admin} do
      params = %{"email" => "admin@example.com", "password" => "correctpass"}

      assert {:ok, %{jwt: jwt}} = Session.authenticate(params)

      # Verify JWT can be decoded and contains role
      {:ok, claims} = Backend.Guardian.decode_and_verify(jwt)
      assert claims["role"] == "admin"
    end

    test "authenticates super_admin" do
      insert(:admin, email: "super@example.com", password_hash: Bcrypt.hash_pwd_salt("password"), role: "super_admin")
      params = %{"email" => "super@example.com", "password" => "password"}

      assert {:ok, %{admin: admin, jwt: _jwt}} = Session.authenticate(params)
      assert admin.role == "super_admin"
    end
  end
end
