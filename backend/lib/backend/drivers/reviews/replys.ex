defmodule Backend.Reviews.Replys do
  alias Backend.Repo
  alias Backend.Reviews.Reply

  import Ecto.Query

  def create(params, %{user_id: user_id}) do
    params = Map.put(params, :user_id, user_id)

    %Reply{}
    |> Reply.changeset(params)
    |> Repo.insert()
  end

  def get_reply(id) do
    Repo.get_by(Reply, id: id)
    |> format_reply()
  end

  def delete(%Reply{id: id} = reply) do
    Repo.delete(reply)
  end

  def format_reply(%Reply{} = reply), do: {:ok, reply}
  def format_reply(nil), do: {:error, :not_found}
end
