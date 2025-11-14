defmodule BackendWeb.Messenger.ThreadJSON do
  alias BackendWeb.Messenger.{MessageJSON, ThreadParticipantJSON, ParticipantJSON}

  def index(%{threads: threads, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(thread <- threads, do: show(%{thread: thread}))
    }
  end

  def show(%{thread: thread}) do
    last_message =
      if thread.last_message, do: MessageJSON.show(%{message: thread.last_message}), else: %{}

    messages =
      if Ecto.assoc_loaded?(thread.messages) do
        MessageJSON.index(%{messages: thread.messages})
      else
        []
      end

        IO.inspect(thread.thread_participants, label: "BBBBBBBBBBBBBBBBBBBBBB")

    %{
      id: thread.id,
      messages: messages,
      thread_participants:
        ThreadParticipantJSON.index(%{thread_participants: thread.thread_participants}),
      last_message: last_message,
      unseen_msg_count: thread.unseen_msg_count
    }
  end
end
