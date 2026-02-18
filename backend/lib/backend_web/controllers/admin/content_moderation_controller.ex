defmodule BackendWeb.Admin.ContentModerationController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Posts
  alias Backend.Clubs

  @doc """
  Lists posts pending moderation for the admin's club.
  Only shows posts from the last 24 hours.
  """
  def index(conn, params, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id) do
      page = Map.get(params, "page", "1") |> String.to_integer()
      per_page = Map.get(params, "per_page", "20") |> String.to_integer()
      status = Map.get(params, "status", "pending")

      opts = [page: page, per_page: per_page, status: status]
      result = Posts.list_posts(club.id, opts)

      conn
      |> put_status(:ok)
      |> render(:index, result: result)
    end
  end

  @doc """
  Gets moderation statistics for the admin's club.
  """
  def stats(conn, _params, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id) do
      stats = Posts.get_stats(club.id)

      conn
      |> put_status(:ok)
      |> render(:stats, stats: stats)
    end
  end

  @doc """
  Creates a new post as official club content.
  Expects asset_ids (array of already uploaded asset IDs) and optional caption.
  Post is automatically approved and doesn't require moderation.
  """
  def create(conn, %{"asset_ids" => asset_ids} = params, session) do
    caption = Map.get(params, "caption", "")

    with {:ok, club} <- Clubs.get_admin_club(session.id),
         {:ok, post} <- create_club_post(session, club.id, asset_ids, caption) do
      conn
      |> put_status(:created)
      |> render(:show, post: post)
    end
  end

  @doc """
  Approves a post.
  """
  def approve(conn, %{"id" => id}, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id),
         {:ok, post} <- Posts.get_post(id),
         :ok <- verify_club_ownership(post, club),
         {:ok, updated_post} <- Posts.approve_post(id) do
      conn
      |> put_status(:ok)
      |> render(:show, post: updated_post)
    end
  end

  @doc """
  Rejects a post.
  """
  def reject(conn, %{"id" => id}, session) do
    with {:ok, club} <- Clubs.get_admin_club(session.id),
         {:ok, post} <- Posts.get_post(id),
         :ok <- verify_club_ownership(post, club),
         {:ok, updated_post} <- Posts.reject_post(id) do
      conn
      |> put_status(:ok)
      |> render(:show, post: updated_post)
    end
  end

  # Verify that the post belongs to the admin's club
  defp verify_club_ownership(post, club) do
    if post.club_id == club.id do
      :ok
    else
      {:error, :unauthorized}
    end
  end

  defp create_club_post(session, club_id, asset_ids, caption) do
    import Ecto.Query
    alias Backend.Repo
    alias Backend.Assets.Asset
    alias Ecto.Multi

    Multi.new()
    |> Multi.run(:validate_assets, fn _repo, _changes ->
      # For admin uploads, assets have nil user_id, so we check they exist and have no user_id
      assets =
        Repo.all(from a in Asset, where: a.id in ^asset_ids and is_nil(a.user_id))

      if length(assets) != length(asset_ids) do
        {:error, "Some assets not found or are not admin uploads"}
      else
        {:ok, assets}
      end
    end)
    |> Multi.run(:create_post, fn _repo, _changes ->
      # Create post as approved club content (no user_id for admin posts)
      Posts.create_post(%{
        user_id: nil,
        club_id: club_id,
        caption: caption,
        status: "approved",
        club_approved_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
      })
    end)
    |> Multi.run(:link_assets, fn _repo, %{create_post: post, validate_assets: assets} ->
      # Update all assets to link them to this post
      asset_ids = Enum.map(assets, & &1.id)

      {count, _} =
        Repo.update_all(
          from(a in Asset, where: a.id in ^asset_ids),
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
