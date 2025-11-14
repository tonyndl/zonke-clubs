defmodule Backend.Accounts.Session do
  alias Backend.Accounts.{Users, Accounts}
  alias Backend.Guardian

  def authenticate(%{username: username, password: password})
      when is_binary(username) and is_binary(password) do
    with {:ok, user} <- Users.get_user_by(username: username),
         :ok <- Accounts.verify_password(user, password),
         # TODO add ttl option
         {:ok, jwt, _claims} <- Guardian.encode_and_sign(user, %{}, token_type: :access) do
      {:ok,
       %{
         user: user,
         jwt: jwt
       }}
    else
      _ ->
        {:error, :invalid_credentials}
    end
  end

  # def authenticate(%{token: token}) when is_binary(token) do
  #   with {:ok, %{user_id: user_id}} <- Guardian.decode_and_verify(MyApp.Accounts.Guardian, token),
  #        {:ok, user} <- Users.get_user_by(id: user_id) do
  #     {:ok, user}
  #   end
  # end
end
