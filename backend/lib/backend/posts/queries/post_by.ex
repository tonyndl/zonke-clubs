defmodule Backend.Drivers.Queries.PostBy do
  alias Backend.Posts.Post

  import Ecto.Query

  def base_query do
    from(p in Post,
      as: :post
    )
  end

  def by_id(query, id) do
    where(query, [post: p], p.id == ^id)
  end

  def by_user_id(query, id) do
    query
    |> join(:inner, [post: p], bp in assoc(p, :business_profile), as: :business_profile)
    |> where([business_profile: bp], bp.user_id == ^id)
  end
end
