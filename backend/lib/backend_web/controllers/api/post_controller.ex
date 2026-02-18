defmodule BackendWeb.API.PostController do
  use BackendWeb, :controller
  import Ecto.Query
  alias Backend.Posts
  alias Backend.Repo
  alias Ecto.Multi

  action_fallback BackendWeb.FallbackController

  @doc """
  Creates a new post with uploaded assets.
  Expects:
  - club_id: The club this post belongs to
  - asset_ids: Array of asset IDs that were already uploaded
  - caption: Optional post caption/description
  """
  def create(conn, %{"club_id" => club_id, "asset_ids" => asset_ids} = params, session) do
    caption = Map.get(params, "caption", "")

    with {:ok, post} <- create_post_with_assets(session, club_id, asset_ids, caption) do
      conn
      |> put_status(:created)
      |> render(:show, post: post)
    end
  end

  @doc """
  Lists posts for a specific club.
  """
  def index(conn, %{"club_id" => club_id} = params, session) do
    page = Map.get(params, "page", "1") |> String.to_integer()
    per_page = Map.get(params, "per_page", "20") |> String.to_integer()

    # Only show approved posts to mobile users
    # Pass user_id to include like information
    user_id = if session, do: session.id, else: nil
    opts = [page: page, per_page: per_page, status: "approved", user_id: user_id]

    result = Posts.list_posts(club_id, opts)

    conn
    |> put_status(:ok)
    |> render(:index, result: result, user_id: user_id)
  end

  @doc """
  Gets a single post by ID.
  """
  def show(conn, %{"id" => id}, _session) do
    with {:ok, post} <- Posts.get_post(id) do
      conn
      |> put_status(:ok)
      |> render(:show, post: post)
    end
  end

  @doc """
  Lists posts created by the authenticated user.
  """
  def user_posts(conn, params, session) do
    page = Map.get(params, "page", "1") |> String.to_integer()
    per_page = Map.get(params, "per_page", "20") |> String.to_integer()

    # Fetch user's own posts (all statuses)
    posts = Repo.all(
      from p in Backend.Posts.Post,
      where: p.user_id == ^session.id,
      order_by: [desc: p.inserted_at],
      limit: ^per_page,
      offset: ^((page - 1) * per_page),
      preload: [:user, :assets]
    )

    total_count = Repo.one(
      from p in Backend.Posts.Post,
      where: p.user_id == ^session.id,
      select: count(p.id)
    )

    total_pages = ceil(total_count / per_page)

    result = %{
      posts: posts,
      page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages,
      has_next: page < total_pages,
      has_prev: page > 1
    }

    conn
    |> put_status(:ok)
    |> render(:index, result: result)
  end

  @doc """
  Updates a post (only caption can be updated).
  Only the post owner can update their post.
  """
  def update(conn, %{"id" => id} = params, session) do
    with {:ok, post} <- Posts.get_post(id),
         :ok <- verify_post_owner(post, session),
         {:ok, updated_post} <- Posts.update_post(post, params) do
      conn
      |> put_status(:ok)
      |> render(:show, post: updated_post)
    end
  end

  @doc """
  Deletes a post and its associated assets.
  Only the post owner can delete their post.
  """
  def delete(conn, %{"id" => id}, session) do
    with {:ok, post} <- Posts.get_post(id),
         :ok <- verify_post_owner(post, session),
         {:ok, _deleted_post} <- Posts.delete_post(post) do
      conn
      |> put_status(:no_content)
      |> send_resp(:no_content, "")
    end
  end

  defp verify_post_owner(post, session) do
    if post.user_id == session.id do
      :ok
    else
      {:error, :unauthorized}
    end
  end

  defp create_post_with_assets(session, club_id, asset_ids, caption) do
    Multi.new()
    |> Multi.run(:validate_assets, fn _repo, _changes ->
      # Ensure all assets belong to the user
      assets = Repo.all(from a in Backend.Assets.Asset,
        where: a.id in ^asset_ids and a.user_id == ^session.id)

      if length(assets) != length(asset_ids) do
        {:error, "Some assets not found or don't belong to you"}
      else
        {:ok, assets}
      end
    end)
    |> Multi.run(:create_post, fn _repo, _changes ->
      # Post starts as pending - club admin must approve within 24 hours
      Posts.create_post(%{
        user_id: session.id,
        club_id: club_id,
        caption: caption,
        status: "pending"
      })
    end)
    |> Multi.run(:link_assets, fn _repo, %{create_post: post, validate_assets: assets} ->
      # Update all assets to link them to this post
      asset_ids = Enum.map(assets, & &1.id)

      {count, _} = Repo.update_all(
        from(a in Backend.Assets.Asset, where: a.id in ^asset_ids),
        set: [post_id: post.id, updated_at: DateTime.utc_now()]
      )

      if count == length(assets) do
        {:ok, count}
      else
        {:error, "Failed to link assets to post"}
      end
    end)
    |> Multi.run(:load_post, fn _repo, %{create_post: post} ->
      # Reload post with assets
      Posts.get_post(post.id)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{load_post: post}} ->
        {:ok, post}

      {:error, _failed_operation, reason, _changes_so_far} ->
        {:error, reason}
    end
  end
end
