defmodule Backend.Accounts.Session do
  @moduledoc """
  Handles user authentication and session creation.
  """
  alias Backend.Accounts.Users
  alias Backend.Guardian

  @doc """
  Authenticates a user with username and password.
  Returns {:ok, %{user: user, jwt: jwt}} on success.
  Returns {:error, :invalid_credentials} on failure.
  Supports both string and atom keys for flexibility.
  """
  def authenticate(%{username: username, password: password})
      when is_binary(username) and is_binary(password) do
    authenticate_user(username, password)
  end

  def authenticate(%{"username" => username, "password" => password})
      when is_binary(username) and is_binary(password) do
    authenticate_user(username, password)
  end

  def authenticate(_), do: {:error, :invalid_credentials}

  defp authenticate_user(username, password) do
    with {:ok, user} <- Users.get_user_by(username: username),
         :ok <- Users.verify_password(user, password),
         {:ok, jwt, _claims} <- Guardian.encode_and_sign(user, %{}, token_type: :access) do
      {:ok, %{user: user, jwt: jwt}}
    else
      {:error, :not_found} -> {:error, :invalid_credentials}
      {:error, :invalid_password} -> {:error, :invalid_credentials}
      _ -> {:error, :invalid_credentials}
    end
  end
end
