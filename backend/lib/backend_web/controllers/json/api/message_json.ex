defmodule BackendWeb.API.MessageJSON do
  alias Backend.Messenger.{Thread, Message}
  alias Backend.Accounts.User
  alias BackendWeb.Presence
  alias Backend.DateTimeHelper

  @doc """
  Renders a list of threads
  """
  def index(%{threads: threads}) do
    %{threads: Enum.map(threads, &thread_summary/1)}
  end

  @doc """
  Renders a single thread with messages
  """
  def show(%{thread: thread}) do
    %{thread: thread_detail(thread)}
  end

  @doc """
  Renders a single message
  """
  def message(%{message: message}) do
    %{message: message_data(message)}
  end

  @doc """
  Renders cleared response
  """
  def cleared(_assigns) do
    %{message: "Chat cleared successfully"}
  end

  defp thread_summary(thread) do
    last_message =
      if thread.last_message_content do
        %{
          content: thread.last_message_content,
          sent_at: DateTimeHelper.format_display_time(thread.last_message_sent_at),
          inserted_at: format_timestamp(thread.last_message_sent_at),
          sender_id: to_string_id(thread.last_message_sender_id),
          is_read: thread.last_message_is_read,
          status: thread.last_message_status || "sent"
        }
      else
        nil
      end

    %{
      id: to_string_id(thread.id),
      participant: user_data(thread.participant),
      last_message: last_message,
      unread_count: thread.unread_count,
      connection_status: thread.connection_status,
      updated_at: format_timestamp(thread.updated_at)
    }
  end

  defp thread_detail(%Thread{} = thread) do
    %{
      id: to_string_id(thread.id),
      messages: Enum.map(thread.messages, &message_data/1),
      participants: Enum.map(thread.thread_participants, fn tp -> user_data(tp.user) end),
      updated_at: format_timestamp(thread.updated_at)
    }
  end

  defp message_data(%Message{} = message) do
    %{
      id: to_string_id(message.id),
      thread_id: to_string_id(message.thread_id),
      sender_id: to_string_id(message.sender_id),
      content: message.content,
      is_read: message.is_read,
      status: message.status || "sent",
      sent_at: DateTimeHelper.format_display_time(message.inserted_at),
      inserted_at: format_timestamp(message.inserted_at)
    }
  end

  defp user_data(nil), do: nil

  defp user_data(%User{} = user) do
    %{
      id: to_string_id(user.id),
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      is_online: is_user_online(user.id),
      last_seen_at: format_timestamp(user.last_seen_at)
    }
  end

  # Check if user is online using Presence
  defp is_user_online(user_id) do
    user_id_string = to_string_id(user_id)

    # Check presence across all user channels
    presences = Presence.list("user:#{user_id_string}")

    map_size(presences) > 0
  end

  # Helper to format timestamps as UTC ISO8601
  defp format_timestamp(nil), do: nil

  defp format_timestamp(%NaiveDateTime{} = naive_dt) do
    naive_dt
    |> DateTime.from_naive!("Etc/UTC")
    |> DateTime.to_iso8601()
  end

  defp format_timestamp(%DateTime{} = dt) do
    DateTime.to_iso8601(dt)
  end

  defp format_timestamp(timestamp), do: timestamp

  # Helper to convert binary UUIDs to strings
  defp to_string_id(id) when is_binary(id) do
    case Ecto.UUID.cast(id) do
      {:ok, uuid_string} -> uuid_string
      _ -> id
    end
  end

  defp to_string_id(id), do: id
end
