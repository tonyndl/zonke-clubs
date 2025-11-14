defmodule Backend.UserFactory do
  use ExMachina

  alias Backend.Accounts.User

  defmacro __using__(_opts) do
    quote do
      def user_factory do
        %User{
          id: Ecto.UUID.generate(),
          first_name: sequence(:first_name, &"TestFirst#{&1}"),
          last_name: sequence(:last_name, &"TestLast#{&1}"),
          username: sequence(:username, &"testuser#{&1}"),
          email: sequence(:email, &"testuser#{&1}@example.com"),
          password_hash: "password123",
          role: "owner"
        }
      end
    end
  end
end
