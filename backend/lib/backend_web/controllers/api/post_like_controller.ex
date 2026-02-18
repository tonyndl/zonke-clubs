defmodule BackendWeb.API.PostLikeController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Posts

  @doc """
  Toggles a like on a post. If already liked, unlikes it. If not liked, likes it.
  """
  def toggle(conn, %{"post_id" => post_id}, session) do
    with {:ok, result} <- Posts.toggle_like(post_id, session.id) do
      conn
      |> put_status(:ok)
      |> render(:toggle, result: result)
    end
  end
end
