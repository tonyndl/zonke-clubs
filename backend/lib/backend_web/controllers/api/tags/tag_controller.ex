defmodule BackendWeb.Tags.TagController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Tags.{Tags, Tag}

  def create(conn, params, session) do
    with {:ok, %Tag{} = tag} <- Tags.create(params, session) do
      render(conn, :show, tag: tag)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, %Tag{} = tag} <- Tags.get_tag(id) do
      render(conn, :show, tag: tag)
    end
  end

  def update(conn, %{id: id} = params, session) do
    with {:ok, %Tag{} = tag} <- Tags.get_tag(id),
         {:ok, %Tag{} = tag} <- Tags.update(tag, params) do
      render(conn, :show, tag: tag)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, %Tag{} = tag} <- Tags.get_tag(id),
         {:ok, _tag} <- Tags.delete(tag) do
      json(conn, :ok)
    end
  end
end
