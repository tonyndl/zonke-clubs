defmodule BackendWeb.API.PostLikeJSON do
  def toggle(%{result: result}) do
    %{
      liked: result.liked,
      like_count: result.like_count
    }
  end
end
