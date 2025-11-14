defmodule BackendWeb.Posts.PostJSON do
  def index(%{posts: posts, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(post <- posts, do: show(%{post: post}))
    }
  end

  def index(%{posts: posts}) do
    for(post <- posts, do: show(%{post: post}))
  end

  def show(%{post: post}) do
    Map.take(post, [
      :id,
      :description,
      :location,
      :location_options,
      :licences,
      :inserted_at,
      :updated_at
    ])
  end
end
