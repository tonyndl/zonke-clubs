defmodule BackendWeb.Posts.PostController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Posts.Posts

  def index(conn, params, _session) do
    with posts <- Posts.get_posts(params, :public) do
      render(conn, :index, posts: posts)
    end
  end

  def index(conn, params, session) do
    with posts <- Posts.get_posts(params, session) do
      render(conn, :index, posts: posts)
    end
  end

  def create(conn, params, _session) do
    with {:ok, post} <- Posts.create(params) do
      render(conn, :show, post: post)
    end
  end

  def show(conn, %{id: id}, _session) do
    with {:ok, post} <- Posts.get_post(id) do
      render(conn, :show, post: post)
    end
  end

  def update(conn, %{id: id} = params, _session) do
    with {:ok, post} <- Posts.get_post(id),
         {:ok, post} <- Posts.update(post, params) do
      render(conn, :show, post: post)
    end
  end

  def delete(conn, %{id: id}, _session) do
    with {:ok, post} <- Posts.get_post(id),
         {:ok, _vehicle_booking} <- Posts.delete(post) do
      json(conn, :ok)
    end
  end
end
