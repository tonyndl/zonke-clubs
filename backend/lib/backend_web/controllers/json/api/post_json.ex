defmodule BackendWeb.API.PostJSON do
  alias Backend.Assets

  @doc """
  Renders a single post.
  """
  def show(%{post: post}) do
    data(post)
  end

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

  defp data(post) do
    %{
      id: post.id,
      caption: post.caption,
      status: post.status,
      user_id: post.user_id,
      club_id: post.club_id,
      club_name: club_name(post),
      club_approved_at: post.club_approved_at,
      pinned_at: post.pinned_at,
      is_club_approved: post.status == "approved",
      user: user_data(post.user),
      assets: assets_data(post.assets),
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      # Like information
      like_count: Map.get(post, :like_count, 0),
      has_liked: Map.get(post, :has_liked, false),
      # Legacy fields for backward compatibility
      media_type: post.media_type,
      media_url: post.media_url
    }
  end

  defp club_name(%{club: %{name: name}}), do: name
  defp club_name(_), do: nil

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
end
