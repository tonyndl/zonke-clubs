defmodule Backend.Admin.Session do
  @moduledoc """
  Handles admin authentication and session creation.
  """
  alias Backend.Admin.Admins
  alias Backend.Guardian

  @doc """
  Authenticates an admin with email and password.
  Returns {:ok, %{admin: admin, jwt: jwt}} on success.
  Returns {:error, :invalid_credentials} or {:error, :account_inactive} on failure.
  Supports both string and atom keys for flexibility.
  """
  def authenticate(%{email: email, password: password})
      when is_binary(email) and is_binary(password) do
    authenticate_admin(email, password)
  end

  def authenticate(%{"email" => email, "password" => password})
      when is_binary(email) and is_binary(password) do
    authenticate_admin(email, password)
  end

  def authenticate(_), do: {:error, :invalid_credentials}

  defp authenticate_admin(email, password) do
    with {:ok, admin} <- Admins.get_admin_by(email: email),
         :ok <- Admins.check_active(admin),
         :ok <- Admins.verify_password(admin, password),
         {:ok, jwt, _claims} <-
           Guardian.encode_and_sign(admin, %{role: "admin"}, token_type: :access) do
      {:ok, %{admin: admin, jwt: jwt}}
    else
      {:error, :not_found} -> {:error, :invalid_credentials}
      {:error, :invalid_password} -> {:error, :invalid_credentials}
      {:error, :account_inactive} -> {:error, :account_inactive}
      _ -> {:error, :invalid_credentials}
    end
  end
end
