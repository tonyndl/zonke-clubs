defmodule Backend.Accounts.Accounts do
  alias Backend.Accounts.User

  def verify_password(%User{} = user, password) do
    case Bcrypt.check_pass(user, password) do
      {:ok, _} -> :ok
      _ -> Bcrypt.no_user_verify()
    end
  end
end
