defmodule BackendWeb.UserController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Accounts.{Users, Registration}
  alias Backend.Guardian

  def get_current_user(conn, _params, _session) do
    with ["" <> token] <- get_req_header(conn, "authorization"),
         clean_token when is_binary(clean_token) <- String.replace(token, "Bearer ", ""),
         {:ok, claims} <- Guardian.decode_and_verify(clean_token),
         {:ok, %{user_id: user_id}} <- Guardian.resource_from_claims(claims),
         {:ok, user} <- Users.get_user_by(id: user_id) do
      render(conn, :show, %{user: user})
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "User not found"})

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized", reason: inspect(reason)})

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid request"})
    end
  end

  def create(conn, params, _session) do
    # Accounts send email confirmation email
    with {:ok, _user} <- Registration.register_user(params) do
      json(conn, :ok)
    end
  end

  def update(conn, params, %{user_id: user_id}) do
    with {:ok, user} <- Users.get_user_by(id: user_id),
         {:ok, user} <- Users.update(user, params) do
      render(conn, :show, user: user)
    end
  end
end
