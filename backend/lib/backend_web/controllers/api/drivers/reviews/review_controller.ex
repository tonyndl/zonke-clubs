defmodule BackendWeb.Reviews.ReviewController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Reviews.{Reviews, Review}

  def index(conn, params, session) do
    with {:ok, reveiws, paginate} <- Reviews.get_driver_reviews(params.driver_id) do
      render(conn, :index, %{reveiws: reveiws, paginate: paginate})
    end
  end

  def create(conn, params, %{user_id: user_id}) do
    with {:ok, _review} <- Reviews.create(params, user_id) do
      json(conn, :ok)
    end
  end

  def update(conn, %{id: id} = params, session) do
    with {:ok, %Review{} = review} <- Reviews.get_review(id),
         {:ok, _review} <- Reviews.like_or_unlike_review(review, session) do
      json(conn, :ok)
    end
  end
end
