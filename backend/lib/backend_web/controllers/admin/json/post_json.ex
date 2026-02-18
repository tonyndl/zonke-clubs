defmodule BackendWeb.Admin.PostJSON do
  @moduledoc """
  JSON views for posts.
  """

  def index(%{result: result}) do
    %{
      posts: Enum.map(result.posts, &data/1),
      page: result.page,
      per_page: result.per_page,
      total_count: result.total_count,
      total_pages: result.total_pages,
      has_next: result.has_next,
      has_prev: result.has_prev
    }
  end

  def show(%{post: post}) do
    %{post: data(post)}
  end

  defp data(post) do
    %{
      id: post.id,
      user_id: post.user_id,
      club_id: post.club_id,
      caption: post.caption,
      media_type: post.media_type,
      media_url: post.media_url,
      status: post.status,
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      user: user_data(post)
    }
  end

  defp user_data(%{user: %Ecto.Association.NotLoaded{}}), do: nil

  defp user_data(%{user: user}) when not is_nil(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end

  defp user_data(_), do: nil
end
