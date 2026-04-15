defmodule Backend.Posts do
  @moduledoc """
  Context for managing posts and content moderation.
  """
  import Ecto.Query
  alias Backend.Repo
  alias Backend.Posts.Post
  alias Backend.Posts.PostLike
  alias Backend.Assets.Asset

  @doc """
  Lists posts for a club with pagination support.
  Pending posts older than 24 hours are automatically filtered out.
  Includes like count and has_liked status for the given user_id (if provided).
  """
  def list_posts(club_id, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    status = Keyword.get(opts, :status)
    user_id = Keyword.get(opts, :user_id)
    search = Keyword.get(opts, :search)
    user_tagged_only = Keyword.get(opts, :user_tagged_only, false)

    # Only show posts that have at least one asset
    query =
      from p in Post,
        as: :post,
        where: p.club_id == ^club_id,
        where:
          exists(
            from a in Asset,
              where: a.post_id == parent_as(:post).id
          ),
        order_by: [desc: p.inserted_at],
        preload: [:user, :assets, :club]

    # When fetching for moderation, exclude club's own posts (user_id = nil)
    query =
      if user_tagged_only do
        from p in query, where: not is_nil(p.user_id)
      else
        query
      end

    query =
      if status do
        from p in query, where: p.status == ^status
      else
        query
      end

    # Search by caption or username
    query =
      if search && search != "" do
        pattern = "%#{String.downcase(search)}%"
        from p in query,
          where:
            ilike(p.caption, ^pattern) or
              (not is_nil(p.user_id) and
                 p.user_id in subquery(
                   from u in Backend.Accounts.User,
                     where: ilike(u.username, ^pattern),
                     select: u.id
                 ))
      else
        query
      end

    # Filter out pending posts older than 24 hours
    query =
      if status == "pending" do
        cutoff_time = NaiveDateTime.add(NaiveDateTime.utc_now(), -24 * 60 * 60, :second)
        from p in query, where: p.inserted_at >= ^cutoff_time
      else
        query
      end

    offset = (page - 1) * per_page

    posts =
      query
      |> limit(^per_page)
      |> offset(^offset)
      |> Repo.all()
      |> enrich_posts_with_likes(user_id)

    total_count = get_total_count(query)
    total_pages = ceil(total_count / per_page)

    %{
      posts: posts,
      page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages,
      has_next: page < total_pages,
      has_prev: page > 1
    }
  end

  # Add like information to posts
  def enrich_posts_with_likes(posts, user_id) do
    post_ids = Enum.map(posts, & &1.id)

    # Get like counts for all posts
    like_counts =
      from(l in PostLike, where: l.post_id in ^post_ids, group_by: l.post_id, select: {l.post_id, count(l.id)})
      |> Repo.all()
      |> Map.new()

    # Get which posts the user has liked (if user_id provided)
    user_likes =
      if user_id do
        from(l in PostLike, where: l.post_id in ^post_ids and l.user_id == ^user_id, select: l.post_id)
        |> Repo.all()
        |> MapSet.new()
      else
        MapSet.new()
      end

    # Enrich each post with like information
    Enum.map(posts, fn post ->
      Map.merge(post, %{
        like_count: Map.get(like_counts, post.id, 0),
        has_liked: MapSet.member?(user_likes, post.id)
      })
    end)
  end

  defp get_total_count(query) do
    query
    |> exclude(:order_by)
    |> exclude(:preload)
    |> exclude(:select)
    |> select([p], count(p.id))
    |> Repo.one()
  end

  @doc """
  Creates a new post.
  """
  def create_post(attrs) do
    %Post{}
    |> Post.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets a single post by ID with user and assets preloaded.
  """
  def get_post(id) do
    case Repo.get(Post, id) |> Repo.preload([:user, :assets, :club]) do
      nil -> {:error, :not_found}
      post -> {:ok, post}
    end
  end

  @doc """
  Approves a post and sets the club_approved_at timestamp.
  """
  def approve_post(id) do
    with {:ok, post} <- get_post(id) do
      post
      |> Post.changeset(%{
        status: "approved",
        club_approved_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
      })
      |> Repo.update()
    end
  end

  @doc """
  Rejects a post.
  """
  def reject_post(id) do
    with {:ok, post} <- get_post(id) do
      post
      |> Post.changeset(%{status: "rejected"})
      |> Repo.update()
    end
  end

  @doc """
  Gets posts statistics for a club.
  Only counts pending posts within 24 hours.
  Only counts posts that have at least one asset.
  """
  def get_stats(club_id) do
    # Base query - only user-tagged posts with assets (exclude club's own posts)
    query =
      from p in Post,
        as: :post,
        where: p.club_id == ^club_id,
        where: not is_nil(p.user_id),
        where:
          exists(
            from a in Asset,
              where: a.post_id == parent_as(:post).id
          )

    # Count pending posts within 24 hours
    cutoff_time = NaiveDateTime.add(NaiveDateTime.utc_now(), -24 * 60 * 60, :second)
    pending_query = from p in query, where: p.status == "pending" and p.inserted_at >= ^cutoff_time

    %{
      pending: Repo.aggregate(pending_query, :count),
      approved: count_by_status(query, "approved"),
      rejected: count_by_status(query, "rejected"),
      total: Repo.aggregate(query, :count)
    }
  end

  defp count_by_status(query, status) do
    query
    |> where([p], p.status == ^status)
    |> Repo.aggregate(:count)
  end

  @doc """
  Gets dashboard statistics for a club.
  Includes total likes, posts count, and other key metrics.
  """
  def get_dashboard_stats(club_id) do
    # Get all posts for this club (with assets only)
    posts_query =
      from p in Post,
        as: :post,
        where: p.club_id == ^club_id,
        where:
          exists(
            from a in Asset,
              where: a.post_id == parent_as(:post).id
          )

    total_posts = Repo.aggregate(posts_query, :count)

    # Count pending posts within 24 hours
    cutoff_time = NaiveDateTime.add(NaiveDateTime.utc_now(), -24 * 60 * 60, :second)
    pending_posts =
      from(p in posts_query, where: p.status == "pending" and p.inserted_at >= ^cutoff_time)
      |> Repo.aggregate(:count)

    # Get total likes for all posts in this club
    total_likes =
      from(l in PostLike,
        join: p in Post,
        on: l.post_id == p.id,
        where: p.club_id == ^club_id
      )
      |> Repo.aggregate(:count)

    %{
      total_likes: total_likes,
      total_posts: total_posts,
      pending_posts: pending_posts
    }
  end

  @doc """
  Pins a post to the top of the user's profile grid.
  Only the post owner can pin their post.
  """
  def pin_post(id, session) do
    with {:ok, post} <- get_post(id) do
      if post.user_id == session.id do
        post
        |> Post.changeset(%{pinned_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)})
        |> Repo.update()
      else
        {:error, :unauthorized}
      end
    end
  end

  @doc """
  Unpins a post from the user's profile grid.
  Only the post owner can unpin their post.
  """
  def unpin_post(id, session) do
    with {:ok, post} <- get_post(id) do
      if post.user_id == session.id do
        post
        |> Post.changeset(%{pinned_at: nil})
        |> Repo.update()
      else
        {:error, :unauthorized}
      end
    end
  end

  @doc """
  Updates a post's caption.
  """
  def update_post(%Post{} = post, attrs) do
    post
    |> Post.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a post and its associated assets from S3.
  """
  def delete_post(%Post{} = post) do
    # Delete associated assets
    with {:ok, _} <- delete_post_assets(post) do
      Repo.delete(post)
    end
  end

  defp delete_post_assets(%Post{} = post) do
    # Load assets if not already loaded
    post = Repo.preload(post, :assets)

    # Delete each asset from S3 and database
    Enum.each(post.assets, fn asset ->
      Backend.Assets.delete_object(asset.filename)
      Backend.Assets.delete_asset(asset)
    end)

    {:ok, :deleted}
  end

  # ==================== LIKES ====================

  @doc """
  Toggles a like on a post. If the user has already liked it, unlike it. Otherwise, like it.
  Returns {:ok, %{liked: boolean, like_count: integer}}
  """
  def toggle_like(post_id, user_id) do
    case get_existing_like(post_id, user_id) do
      nil ->
        # Create new like
        %PostLike{}
        |> PostLike.changeset(%{post_id: post_id, user_id: user_id})
        |> Repo.insert()
        |> case do
          {:ok, _like} ->
            {:ok, %{liked: true, like_count: get_like_count(post_id)}}

          {:error, changeset} ->
            {:error, changeset}
        end

      like ->
        # Remove existing like
        Repo.delete(like)
        {:ok, %{liked: false, like_count: get_like_count(post_id)}}
    end
  end

  @doc """
  Gets the number of likes for a post.
  """
  def get_like_count(post_id) do
    from(l in PostLike, where: l.post_id == ^post_id)
    |> Repo.aggregate(:count)
  end

  @doc """
  Checks if a user has liked a post.
  """
  def has_user_liked?(post_id, user_id) when is_binary(user_id) do
    get_existing_like(post_id, user_id) != nil
  end

  def has_user_liked?(_post_id, nil), do: false

  defp get_existing_like(post_id, user_id) do
    Repo.get_by(PostLike, post_id: post_id, user_id: user_id)
  end
end
