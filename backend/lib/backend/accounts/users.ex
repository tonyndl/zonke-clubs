defmodule Backend.Accounts.Users do
  @moduledoc """
  Context for user operations.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Accounts.User

  @doc """
  Gets a user by the given options.
  Returns {:ok, user} or {:error, :not_found}.
  """
  def get_user_by(opts) when is_list(opts) do
    case Repo.get_by(User, opts) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  @doc """
  Updates a user's profile.
  Accepts the user struct (from session) and update parameters.
  """
  def update_profile(%User{} = user, attrs) do
    user
    |> User.profile_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Updates a user's account information (username, email, phone).
  Accepts the user struct (from session) and update parameters.
  """
  def update_account_info(%User{} = user, attrs) do
    user
    |> User.account_info_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Changes a user's password after verifying the current password.
  Requires current_password and new_password in params.
  """
  def change_password(%User{} = user, %{
        "current_password" => current_password,
        "new_password" => new_password
      }) do
    with :ok <- verify_password(user, current_password) do
      user
      |> User.password_changeset(%{password: new_password})
      |> Repo.update()
    end
  end

  def change_password(_user, _params), do: {:error, :invalid_params}

  @doc """
  Verifies a user's password.
  Returns :ok if password is correct, {:error, :invalid_password} otherwise.
  """
  def verify_password(%User{} = user, password) when is_binary(password) do
    case Bcrypt.verify_pass(password, user.password_hash) do
      true -> :ok
      false -> {:error, :invalid_password}
    end
  end

  @doc """
  Searches for users by username.
  Returns a list of users matching the search query (case-insensitive).
  Limits to club_goers only and excludes given user IDs.
  """
  def search_users(query, opts \\ []) do
    exclude_ids = Keyword.get(opts, :exclude_ids, [])
    limit = Keyword.get(opts, :limit, 10)
    search_pattern = "%#{query}%"

    from(u in User,
      where: u.role == "club_goer",
      where: u.id not in ^exclude_ids,
      where: ilike(u.username, ^search_pattern),
      limit: ^limit,
      select: [:id, :username, :avatar_url]
    )
    |> Repo.all()
  end

  @doc """
  Updates a user's last_seen_at timestamp to the current time.
  """
  def update_last_seen(user_id) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    case Repo.get(User, user_id) do
      nil ->
        {:error, :not_found}

      user ->
        user
        |> Ecto.Changeset.change(%{last_seen_at: now})
        |> Repo.update()
    end
  end
end
