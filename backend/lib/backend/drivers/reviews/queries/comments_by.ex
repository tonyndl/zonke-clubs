defmodule Backend.Reviews.Queries.CommentsBy do
  alias Backend.Reviews.Comment
  import Ecto.Query

  def base_query() do
    from(c in Comment,
      as: :comment
    )
  end

  def by_id_with_author(comment_id) do
    from(c in Comment,
      where: c.id == ^comment_id,
      join: a in assoc(c, :author),
      select_merge: %{
        c
        | first_name: a.first_name,
          last_name: a.last_name
      }
    )
  end

  def by_driver(query, id) do
    where(query, [comment: c], c.driver_id == ^id)
  end

  def by_user(query, id) do
    where(query, [comment: c], c.user_id == ^id)
  end
end
