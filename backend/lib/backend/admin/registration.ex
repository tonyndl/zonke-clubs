defmodule Backend.Admin.Registration do
  @moduledoc """
  Handles admin registration.
  """
  alias Backend.Repo
  alias Backend.Admin.Admin

  @doc """
  Registers a new admin with the given parameters.
  Returns {:ok, admin} on success or {:error, changeset} on failure.
  """
  def register_admin(params) do
    params
    |> Admin.registration_changeset()
    |> Repo.insert()
  end
end
