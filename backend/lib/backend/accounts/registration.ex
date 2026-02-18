defmodule Backend.Accounts.Registration do
  @moduledoc """
  Handles user registration.
  """
  alias Backend.Repo
  alias Backend.Accounts.User

  @doc """
  Registers a new user with the given parameters.
  Returns {:ok, user} on success or {:error, changeset} on failure.
  """
  def register_user(params) do
    params
    |> User.registration_changeset()
    |> Repo.insert()
  end
end
