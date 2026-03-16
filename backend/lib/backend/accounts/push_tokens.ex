defmodule Backend.Accounts.PushTokens do
  import Ecto.Query

  alias Backend.Repo
  alias Backend.Accounts.PushToken

  @doc """
  Register or update a push token for the authenticated user.
  Uses upsert: if the token already exists, update its user association.
  """
  def register_token(session, attrs) do
    expo_push_token = attrs["expo_push_token"] || attrs[:expo_push_token]

    case Repo.get_by(PushToken, expo_push_token: expo_push_token) do
      nil ->
        %PushToken{}
        |> PushToken.changeset(Map.put(attrs, "user_id", session.id))
        |> Repo.insert()

      existing ->
        existing
        |> PushToken.changeset(Map.merge(attrs, %{"user_id" => session.id}))
        |> Repo.update()
    end
  end

  @doc """
  Get all expo push tokens for a given user ID.
  """
  def get_tokens_for_user(user_id) do
    PushToken
    |> where([pt], pt.user_id == ^user_id)
    |> select([pt], pt.expo_push_token)
    |> Repo.all()
  end

  @doc """
  Delete a specific push token belonging to the authenticated user.
  """
  def delete_token(session, expo_push_token) do
    case Repo.get_by(PushToken, expo_push_token: expo_push_token, user_id: session.id) do
      nil -> {:error, :not_found}
      token ->
        Repo.delete(token)
        {:ok, :deleted}
    end
  end

  @doc """
  Delete a push token by its value (used to clean up stale/unregistered tokens).
  """
  def delete_by_token(expo_push_token) do
    PushToken
    |> where([pt], pt.expo_push_token == ^expo_push_token)
    |> Repo.delete_all()
  end
end
