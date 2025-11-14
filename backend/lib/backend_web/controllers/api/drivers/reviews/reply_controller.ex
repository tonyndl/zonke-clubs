defmodule BackendWeb.Reviews.ReplyController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Reviews.{Replys, Reply}

  def create(conn, params, %{user_id: user_id}) do
    with {:ok, _reply} <- Replys.create(params, user_id) do
      json(conn, :ok)
    end
  end

  def delete(conn, %{id: id}, session) do
    with {:ok, reply} <- Replys.get_reply(id),
         {:ok, _reply} <- Replys.delete(reply) do
      json(conn, :ok)
    end
  end
end
