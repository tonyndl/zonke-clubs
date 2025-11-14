defmodule Backend.Posts.Posts do
  alias Backend.Assets.Assets
  alias Backend.Posts.Post
  alias Backend.Drivers.Queries.PostBy
  alias Ecto.Multi
  alias Backend.{Repo, PaginateHelper}

  def create(params) do
    post_params = Map.delete(params, :asset)

    Multi.new()
    |> Multi.insert(
      :post,
      Post.changeset(%Post{}, post_params)
    )
    |> Multi.run(:asset, fn _repo, %{post: post} ->
      asset_params =
        params
        |> Map.get(:asset, %{})
        |> Map.put(:post_id, post.id)

      Assets.upload_and_save(asset_params)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{post: post}} ->
        {:ok, post}

      {:error, step, reason, changes_so_far} ->
        {:error, step, reason}
    end
  end

  def update(%Post{} = post, params) do
    post
    |> Post.changeset(params)
    |> Repo.update()
  end

  def delete(%Post{id: id} = post) do
    Repo.delete(post)
  end

  def get_post(id) do
    Repo.get_by(Post, id: id)
    |> format_post()
  end

  def get_posts(params, :public) do
    data =
      PostBy.base_query()
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  def get_posts(params, %{user_id: user_id}) do
    data =
      PostBy.base_query()
      |> PostBy.by_user_id(user_id)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  defp format_post(%Post{} = post), do: {:ok, post}
  defp format_post(nil), do: {:error, :not_found}
end
