defmodule BackendWeb.API.UserController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.{Registration, Users}

  @doc """
  Register a new user.
  Public endpoint - no authentication required.
  """
  def create(conn, params, _session) do
    with {:ok, user} <- Registration.register_user(params) do
      conn
      |> put_status(:created)
      |> render(:show, user: user)
    end
  end

  @doc """
  Get current user profile.
  Requires authentication - session contains the current user.
  """
  def show(conn, _params, session) do
    conn
    |> put_status(:ok)
    |> render(:show, user: session)
  end

  @doc """
  Get any user's public profile by ID.
  Public endpoint - no authentication required.
  """
  def show_public(conn, %{"id" => id}, _session) do
    with {:ok, user} <- Users.get_user_by(id: id) do
      conn
      |> put_status(:ok)
      |> render(:show, user: user)
    end
  end

  @doc """
  Update current user profile.
  Requires authentication - session contains the current user.
  """
  def update(conn, params, session) do
    with {:ok, updated_user} <- Users.update_profile(session, params) do
      conn
      |> put_status(:ok)
      |> render(:show, user: updated_user)
    end
  end

  @doc """
  Update current user account information (name, username, email, phone).
  Requires authentication - session contains the current user.
  """
  def update_account(conn, params, session) do
    with {:ok, updated_user} <- Users.update_account_info(session, params) do
      conn
      |> put_status(:ok)
      |> render(:show, user: updated_user)
    end
  end

  @doc """
  Change current user password.
  Requires authentication - session contains the current user.
  Requires current_password and new_password in params.
  """
  def change_password(conn, params, session) do
    with {:ok, _updated_user} <- Users.change_password(session, params) do
      conn
      |> put_status(:ok)
      |> render(:password_changed, message: "Password changed successfully")
    end
  end

end
