defmodule Backend.Accounts.RegistrationTest do
  use Backend.DataCase, async: true

  alias Backend.Accounts.{Registration, Users}
  alias Backend.Accounts.User

  setup do
    params = %{
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "secret123"
    }

    %{params: params}
  end

  describe "register_user/1" do
    test "creates a user with valid data", %{params: params} do
      assert {:ok, %User{} = user} = Registration.register_user(params)
      {:ok, fetched_user} = Users.get_user_by(email: params.email)

      assert fetched_user.first_name == "John"
    end

    test "fails with missing required fields", %{params: params} do
      invalid_params = Map.drop(params, [:email])

      assert {:error, changeset} = Registration.register_user(invalid_params)
      assert %{email: ["can't be blank"]} = errors_on(changeset)
    end

    test "register_user/1 fails with short password", %{params: params} do
      attrs = Map.put(params, :password, "123")

      assert {:error, changeset} = Registration.register_user(attrs)
      assert %{password: ["should be at least 6 character(s)"]} = errors_on(changeset)
    end
  end
end
