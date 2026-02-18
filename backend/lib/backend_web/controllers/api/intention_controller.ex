defmodule BackendWeb.API.IntentionController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Intentions

  @doc """
  List all intentions for a specific club.
  Public endpoint - no authentication required.
  Optionally exclude a specific user's intentions by passing exclude_user_id param.
  """
  def club_intentions(conn, %{"club_id" => club_id} = params, _session) do
    exclude_user_id = Map.get(params, "exclude_user_id")
    intentions = Intentions.list_club_intentions(club_id, exclude_user_id)

    conn
    |> put_status(:ok)
    |> render(:index, intentions: intentions)
  end

  @doc """
  Create a new intention.
  Requires authentication.
  """
  def create(conn, params, session) do
    intention_params = Map.put(params, "user_id", session.id)

    with {:ok, intention} <- Intentions.create_intention(intention_params) do
      intention = Backend.Repo.preload(intention, :user)

      conn
      |> put_status(:created)
      |> render(:show, intention: intention)
    end
  end

  @doc """
  Update an intention.
  Requires authentication and ownership.
  """
  def update(conn, %{"id" => id} = params, session) do
    with {:ok, intention} <- Intentions.get_intention(id),
         :ok <- authorize_user(intention, session.id),
         {:ok, updated_intention} <- Intentions.update_intention(intention, params) do
      updated_intention = Backend.Repo.preload(updated_intention, :user)

      conn
      |> put_status(:ok)
      |> render(:show, intention: updated_intention)
    end
  end

  @doc """
  Delete an intention.
  Requires authentication and ownership.
  """
  def delete(conn, %{"id" => id}, session) do
    with {:ok, intention} <- Intentions.get_intention(id),
         :ok <- authorize_user(intention, session.id),
         {:ok, _deleted} <- Intentions.delete_intention(intention) do
      conn
      |> put_status(:no_content)
      |> send_resp(204, "")
    end
  end

  # Private helper to check if user owns the intention
  defp authorize_user(intention, user_id) do
    if intention.user_id == user_id do
      :ok
    else
      {:error, :unauthorized}
    end
  end
end
