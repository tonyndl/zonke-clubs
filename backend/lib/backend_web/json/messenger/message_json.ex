defmodule BackendWeb.Messenger.MessageJSON do
  alias Backend.DateTimeHelper

  def index(%{messages: messages}) do
    for(message <- messages, do: show(%{message: message}))
  end

  def show(%{message: message}) do
    Map.take(message, [
      :id,
      :content,
      :recipient_id,
      :author_id,
      :thread_id,
      :seen,
      :visible,
      :sent_at,
      :created_at,
      :metadata
    ])
    |> Map.merge(%{sent_at: DateTimeHelper.date_time(message.inserted_at)})
  end
end
