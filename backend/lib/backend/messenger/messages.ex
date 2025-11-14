defmodule Backend.Messenger.Messages do
  import Ecto.Query

  alias Ecto.Multi
  alias Backend.Repo
  alias Backend.Messenger.Threads
  alias Backend.Messenger.Schemas.Message

  require Logger

  def create(params, user_id) do
    new_params = Map.put(params, :author_id, user_id)

    %Message{}
    |> Message.changeset(new_params)
    |> Repo.insert()
  end

  def get_message(id) do
    Repo.get_by(Message, id: id)
    |> format_message()
  end

  def get_thread_messages(thread_id) do
    from(m in Message,
      where: m.thread_id == ^thread_id,
      order_by: [asc: m.inserted_at]
    )
    |> Repo.all()
  end

  def update(%Message{} = message, params) do
    updated_message =
      message
      |> Message.changeset(params)
      |> Repo.update()

    case updated_message do
      {:ok, message} ->
        MessengerChannel.push_out!(message)
        format_message(message)

      {:error, error} ->
        {:error, error}
    end
  end

  def delete(message) do
    Repo.delete(message)
  end

  def unseen_messages_count(thread_id, participant_id) do
    Repo.one(
      from(m in Message,
        where: m.thread_id == ^thread_id,
        where: m.author_id != ^participant_id,
        where: m.seen == true,
        select: count(m.id)
      )
    )
  end

  def format_message(%Message{} = message), do: {:ok, message}
  def format_message(nil), do: {:error, :not_found}
end
