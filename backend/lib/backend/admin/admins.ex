defmodule Backend.Admin.Admins do
  @moduledoc """
  Context for admin operations.
  """
  alias Backend.Repo
  alias Backend.Admin.Admin

  @doc """
  Gets an admin by the given options.
  Returns {:ok, admin} or {:error, :not_found}.
  """
  def get_admin_by(opts) when is_list(opts) do
    case Repo.get_by(Admin, opts) do
      nil -> {:error, :not_found}
      admin -> {:ok, admin}
    end
  end

  @doc """
  Updates an admin's profile.
  Accepts the admin struct (from session) and update parameters.
  """
  def update_profile(%Admin{} = admin, attrs) do
    admin
    |> Admin.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Changes an admin's password after verifying the current password.
  Requires current_password and new_password in params.
  """
  def change_password(%Admin{} = admin, %{
        "current_password" => current_password,
        "new_password" => new_password
      }) do
    with :ok <- verify_password(admin, current_password) do
      admin
      |> Admin.password_changeset(%{password: new_password})
      |> Repo.update()
    end
  end

  def change_password(_admin, _params), do: {:error, :invalid_params}

  @doc """
  Verifies an admin's password.
  Returns :ok if password is correct, {:error, :invalid_password} otherwise.
  """
  def verify_password(%Admin{} = admin, password) when is_binary(password) do
    case Bcrypt.verify_pass(password, admin.password_hash) do
      true -> :ok
      false -> {:error, :invalid_password}
    end
  end

  @doc """
  Deletes an admin account after verifying the password.
  """
  def delete_account(%Admin{} = admin, %{"password" => password}) do
    with :ok <- verify_password(admin, password) do
      Repo.delete(admin)
    end
  end

  def delete_account(_admin, _params), do: {:error, :invalid_params}

  @doc """
  Checks if an admin account is active.
  Returns :ok if active, {:error, :account_inactive} if not.
  """
  def check_active(%Admin{active: true}), do: :ok
  def check_active(%Admin{active: false}), do: {:error, :account_inactive}
end
