defmodule BackendWeb.Reviews.CommentJSON do
  alias BackendWeb.Reviews.ReplyJSON
  alias Backend.DateTimeHelper

  def index(%{comments: comments, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(comment <- comments, do: show(%{comment: comment}))
    }
  end

  def index(%{comments: comments}) do
    for(comment <- comments, do: show(%{comment: comment}))
  end

  def show(%{comment: comment}) do
    %{
      id: comment.id,
      text: comment.text,
      first_name: comment.first_name,
      last_name: comment.last_name,
      updated_at: comment.updated_at,
      inserted_at: comment.inserted_at
      # replys: ReplyJSON.index(%{replys: comment.replys})
    }
    |> Map.merge(%{sent_at: DateTimeHelper.date_time(comment.inserted_at)})
  end
end
