defmodule Backend.Accounts.Registration do
  alias Backend.Repo
  alias Backend.Accounts.User

  def register_user(params) do
    User.registration_changeset(params)
    |> Repo.insert()
  end
end
