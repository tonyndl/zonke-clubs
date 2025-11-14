defmodule Backend.Reviews.Comments do
  alias Backend.{Repo, PaginateHelper}
  alias Backend.Reviews.Comment
  alias Backend.Accounts.User
  alias Backend.Reviews.Queries.CommentsBy

  import Ecto.Query

  def create(params, user_id) do
    params = Map.put(params, :author_id, user_id)

    case %Comment{}
         |> Comment.changeset(params)
         |> Repo.insert() do
      {:ok, comment} ->
        {:ok, Repo.one(CommentsBy.by_id_with_author(comment.id))}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  def get_comment(id) do
    Repo.get_by(Comment, id: id)
    |> format_comment()
  end

  def delete(%Comment{id: id} = comment) do
    Repo.delete(comment)
  end

  def get_driver_comments(params) do
    data =
      CommentsBy.base_query()
      |> CommentsBy.by_driver(params.driver_id)
      |> join(:inner, [c], a in assoc(c, :author), as: :author)
      |> select_merge([c, a], %{
        c
        | first_name: a.first_name,
          last_name: a.last_name
      })
      |> order_by([c], desc: c.inserted_at)
      # |> preload(:replys)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  def get_my_comments(user_id) do
    CommentsBy.base_query()
    |> CommentsBy.by_user(user_id)
    |> Repo.all()
  end

  def format_comment(%Comment{} = comment), do: {:ok, comment}
  def format_comment(nil), do: {:error, :not_found}
end
