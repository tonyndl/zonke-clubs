defmodule BackendWeb.Reviews.CommentController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Reviews.{Comments, Comment}

  def index(conn, params, session) do
    with {:ok, comments, paginate} <- Comments.get_driver_comments(params) do
      render(conn, :index, %{comments: comments, paginate: paginate})
    end
  end

  def create(conn, params, %{user_id: user_id}) do
    with {:ok, comment} <- Comments.create(params, user_id) do
      render(conn, :show, %{comment: comment})
    end
  end
end
