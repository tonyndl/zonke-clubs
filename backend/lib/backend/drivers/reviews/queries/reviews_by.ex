defmodule Backend.Reviews.Queries.ReviewBy do
  alias Backend.Reviews.Review
  import Ecto.Query

  def base_query() do
    from(r in Review,
      as: :review
    )
  end

  def by_driver(query, id) do
    where(query, [review: r], r.driver_id == ^id)
  end

  def by_user(query, id) do
    where(query, [review: r], r.user_id == ^id)
  end
end
