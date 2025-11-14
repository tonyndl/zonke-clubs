defmodule BackendWeb.Reviews.ReplyJSON do
  def index(%{replys: replys}) do
    for(reply <- replys, do: show(%{reply: reply}))
  end

  def show(%{reply: reply}) do
    %{
      id: reply.id,
      text: reply.text,
      updated_at: reply.updated_at,
      inserted_at: reply.inserted_at
    }
  end
end
