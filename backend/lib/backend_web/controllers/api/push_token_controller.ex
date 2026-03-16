defmodule BackendWeb.API.PushTokenController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.PushTokens

  @doc """
  Get push tokens for a user by user_id query param.
  """
  def index(conn, %{"user_id" => user_id}, _session) do
    tokens = PushTokens.get_tokens_for_user(user_id)

    conn
    |> put_status(:ok)
    |> render(:index, tokens: tokens)
  end

  @doc """
  Register a push token for the current user.
  """
  def create(conn, params, session) do
    with {:ok, _token} <- PushTokens.register_token(session, params) do
      conn
      |> put_status(:ok)
      |> render(:ok)
    end
  end

  @doc """
  Delete a push token for the current user.
  Token is passed as expo_push_token query param.
  """
  def delete(conn, %{"expo_push_token" => expo_push_token}, session) do
    with {:ok, _} <- PushTokens.delete_token(session, expo_push_token) do
      conn
      |> put_status(:ok)
      |> render(:ok)
    end
  end
end
