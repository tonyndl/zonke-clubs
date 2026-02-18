defmodule BackendWeb.API.DJController do
  use BackendWeb, :controller

  action_fallback BackendWeb.FallbackController

  alias Backend.DJs

  def index(conn, _params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id) do
      djs = DJs.list_djs(club.id)

      conn
      |> put_status(:ok)
      |> render(:index, djs: djs)
    end
  end

  def show(conn, %{"id" => id}, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, dj} <- DJs.get_dj(id, club.id) do
      conn
      |> put_status(:ok)
      |> render(:show, dj: dj)
    end
  end

  def create(conn, params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, dj} <- DJs.create_dj(params, club.id) do
      conn
      |> put_status(:created)
      |> render(:show, dj: dj)
    end
  end

  def update(conn, %{"id" => id} = params, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, dj} <- DJs.get_dj(id, club.id),
         {:ok, updated_dj} <- DJs.update_dj(dj, params) do
      conn
      |> put_status(:ok)
      |> render(:show, dj: updated_dj)
    end
  end

  def delete(conn, %{"id" => id}, session) do
    with {:ok, club} <- Backend.Clubs.get_admin_club(session.id),
         {:ok, dj} <- DJs.get_dj(id, club.id),
         {:ok, _} <- DJs.delete_dj(dj) do
      conn
      |> put_status(:ok)
      |> json(%{message: "DJ deleted successfully"})
    end
  end
end
