defmodule BackendWeb.API.ClubController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.Clubs

  def index(conn, params, session) do
    {clubs, paginate} = Clubs.list_clubs_with_likes(session, params)

    conn
    |> put_status(:ok)
    |> render(:index, clubs: clubs, paginate: paginate)
  end

  def show(conn, %{"id" => id}, _session) do
    with {:ok, club} <- Clubs.get_club(id) do
      conn
      |> put_status(:ok)
      |> render(:show, club: club)
    end
  end

  def like(conn, %{"id" => club_id}, session) do
    with {:ok, _club_like} <- Clubs.like_club(club_id, session) do
      conn
      |> put_status(:ok)
      |> render(:like_success, message: "Club liked successfully")
    end
  end

  def unlike(conn, %{"id" => club_id}, session) do
    with {:ok, _club_like} <- Clubs.unlike_club(club_id, session) do
      conn
      |> put_status(:ok)
      |> render(:unlike_success, message: "Club unliked successfully")
    end
  end

  def favorites(conn, _params, session) do
    clubs = Clubs.get_user_favorite_clubs(session)

    conn
    |> put_status(:ok)
    |> render(:favorites, clubs: clubs)
  end
end
