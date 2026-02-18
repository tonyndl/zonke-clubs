defmodule BackendWeb.Admin.PostController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Posts
  alias Backend.Clubs.Club
  alias Backend.Repo

  @doc """
  Lists all posts for the admin's club with pagination.
  Query params:
  - page: page number (default: 1)
  - per_page: items per page (default: 20)
  - status: filter by status (pending/approved/rejected)
  """
  def index(conn, params, _session) do
    club_id = get_admin_club_id()
    page = Map.get(params, "page", "1") |> String.to_integer()
    per_page = Map.get(params, "per_page", "20") |> String.to_integer()
    status = Map.get(params, "status")

    opts = [page: page, per_page: per_page]
    opts = if status, do: Keyword.put(opts, :status, status), else: opts

    result = Posts.list_posts(club_id, opts)

    conn
    |> put_status(:ok)
    |> render(:index, result: result)
  end

  @doc """
  Approves a post.
  """
  def approve(conn, %{"id" => id}, _session) do
    with {:ok, post} <- Posts.approve_post(id) do
      conn
      |> put_status(:ok)
      |> render(:show, post: post)
    end
  end

  @doc """
  Rejects a post.
  """
  def reject(conn, %{"id" => id}, _session) do
    with {:ok, post} <- Posts.reject_post(id) do
      conn
      |> put_status(:ok)
      |> render(:show, post: post)
    end
  end

  @doc """
  Gets posts statistics.
  """
  def stats(conn, _params, _session) do
    club_id = get_admin_club_id()
    stats = Posts.get_stats(club_id)

    conn
    |> put_status(:ok)
    |> json(stats)
  end

  # Helper function to get the club_id from admin session
  defp get_admin_club_id do
    # TODO: Get the actual club_id from the admin's session/profile
    # For now, get the first club from the database
    case Repo.all(Club) |> List.first() do
      nil -> nil
      club -> club.id
    end
  end
end
