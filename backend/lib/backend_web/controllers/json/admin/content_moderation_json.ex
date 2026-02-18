defmodule BackendWeb.Admin.ContentModerationJSON do
  alias Backend.Assets

  @doc """
  Renders a list of posts with pagination info.
  """
  def index(%{result: result}) do
    %{
      posts: Enum.map(result.posts, &data/1),
      pagination: %{
        page: result.page,
        per_page: result.per_page,
        total_count: result.total_count,
        total_pages: result.total_pages,
        has_next: result.has_next,
        has_prev: result.has_prev
      }
    }
  end

  @doc """
  Renders a single post.
  """
  def show(%{post: post}) do
    data(post)
  end

  @doc """
  Renders moderation statistics.
  """
  def stats(%{stats: stats}) do
    stats
  end

  defp data(post) do
    %{
      id: post.id,
      caption: post.caption,
      status: post.status,
      user_id: post.user_id,
      club_id: post.club_id,
      club_approved_at: post.club_approved_at,
      user: user_data(post.user),
      assets: assets_data(post.assets),
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      # Calculate time remaining for pending posts (in seconds)
      time_remaining: calculate_time_remaining(post),
      # Like count (total likes for this post)
      like_count: Map.get(post, :like_count, 0),
      # Legacy fields for backward compatibility
      media_type: post.media_type,
      media_url: post.media_url
    }
  end

  defp user_data(nil), do: nil
  defp user_data(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end

  defp assets_data(nil), do: []
  defp assets_data(assets) when is_list(assets) do
    Enum.map(assets, fn asset ->
      %{
        id: asset.id,
        filename: asset.filename,
        url: Assets.prepare_url(asset.filename, %{public: true}),
        meta: asset.meta || %{},
        type: determine_type(asset),
        # Include video metadata if available
        duration: get_in(asset.meta, ["duration"]),
        start_time: get_in(asset.meta, ["start_time"]),
        end_time: get_in(asset.meta, ["end_time"])
      }
    end)
  end

  defp determine_type(asset) do
    meta = asset.meta || %{}
    cond do
      # Check explicit type field first
      Map.has_key?(meta, "type") -> meta["type"]
      # Fall back to checking for duration (for backwards compatibility)
      Map.has_key?(meta, "duration") -> "video"
      true -> "image"
    end
  end

  # Calculate time remaining for pending posts (24 hour window)
  defp calculate_time_remaining(post) do
    if post.status == "pending" do
      expires_at = NaiveDateTime.add(post.inserted_at, 24 * 60 * 60, :second)
      now = NaiveDateTime.utc_now()

      remaining_seconds = NaiveDateTime.diff(expires_at, now, :second)

      if remaining_seconds > 0, do: remaining_seconds, else: 0
    else
      nil
    end
  end
end
