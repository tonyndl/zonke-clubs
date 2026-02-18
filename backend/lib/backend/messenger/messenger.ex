defmodule Backend.Messenger.Messenger do
  @moduledoc """
  The Messenger context for handling chat threads and messages.
  """

  import Ecto.Query
  alias Backend.Repo
  alias Backend.Messenger.{Thread, ThreadParticipant, Message}
  alias Backend.Accounts.User

  @doc """
  Creates a new thread with two participants.
  """
  def create_thread(user1_id, user2_id) do
    Ecto.Multi.new()
    |> Ecto.Multi.insert(:thread, Thread.changeset(%Thread{}, %{}))
    |> Ecto.Multi.insert(:participant1, fn %{thread: thread} ->
      ThreadParticipant.changeset(%ThreadParticipant{}, %{
        thread_id: thread.id,
        user_id: user1_id
      })
    end)
    |> Ecto.Multi.insert(:participant2, fn %{thread: thread} ->
      ThreadParticipant.changeset(%ThreadParticipant{}, %{
        thread_id: thread.id,
        user_id: user2_id
      })
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{thread: thread}} -> {:ok, thread}
      {:error, _failed_operation, changeset, _changes_so_far} -> {:error, changeset}
    end
  end

  @doc """
  Gets or creates a thread between two users.
  """
  def get_or_create_thread(user1_id, user2_id) do
    case find_thread_between_users(user1_id, user2_id) do
      nil -> create_thread(user1_id, user2_id)
      thread -> {:ok, thread}
    end
  end

  @doc """
  Finds an existing thread between two users.
  """
  def find_thread_between_users(user1_id, user2_id) do
    from(t in Thread,
      join: tp1 in ThreadParticipant,
      on: tp1.thread_id == t.id and tp1.user_id == type(^user1_id, :binary_id),
      join: tp2 in ThreadParticipant,
      on: tp2.thread_id == t.id and tp2.user_id == type(^user2_id, :binary_id),
      select: t
    )
    |> Repo.one()
  end

  @doc """
  Lists all threads for a given user with participant info and last message.
  """
  def list_user_threads(session) do
    user_id = session.id

    alias Backend.Connections.ConnectionRequest

    from(t in Thread,
      join: tp in ThreadParticipant,
      on: tp.thread_id == t.id and tp.user_id == type(^user_id, :binary_id),
      left_join: m in Message,
      on: m.thread_id == t.id,
      left_join: other_tp in ThreadParticipant,
      on: other_tp.thread_id == t.id and other_tp.user_id != type(^user_id, :binary_id),
      left_join: other_user in User,
      on: other_user.id == other_tp.user_id,
      left_join: cr in ConnectionRequest,
      on: cr.thread_id == t.id,
      group_by: [t.id, other_user.id],
      select: %{
        id: t.id,
        participant: other_user,
        last_message_content:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            m.content,
            m.inserted_at,
            m.content
          ),
        last_message_sent_at:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            m.inserted_at,
            m.inserted_at,
            m.inserted_at
          ),
        last_message_sender_id:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            m.sender_id,
            m.inserted_at,
            m.sender_id
          ),
        last_message_is_read:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            m.is_read,
            m.inserted_at,
            m.is_read
          ),
        last_message_status:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            m.status,
            m.inserted_at,
            m.status
          ),
        unread_count:
          fragment(
            "COUNT(CASE WHEN ? = false AND ? != ? THEN 1 END)",
            m.is_read,
            m.sender_id,
            type(^user_id, :binary_id)
          ),
        connection_status:
          fragment(
            "(array_agg(? ORDER BY ? DESC NULLS LAST) FILTER (WHERE ? IS NOT NULL))[1]",
            cr.status,
            cr.updated_at,
            cr.status
          ),
        updated_at: t.updated_at
      },
      order_by: [desc: fragment("COALESCE(MAX(?), ?)", m.inserted_at, t.updated_at)]
    )
    |> Repo.all()
  end

  @doc """
  Gets a specific thread with all its messages if the user is a participant.
  """
  def get_thread(thread_id, session) do
    user_id = session.id

    # First verify the user is a participant
    participant_query =
      from(tp in ThreadParticipant,
        where: tp.thread_id == ^thread_id and tp.user_id == type(^user_id, :binary_id)
      )

    case Repo.one(participant_query) do
      nil ->
        {:error, :not_found}

      _participant ->
        thread =
          Thread
          |> Repo.get(thread_id)
          |> Repo.preload(
            messages: from(m in Message, order_by: [asc: m.inserted_at]),
            thread_participants: :user
          )

        {:ok, thread}
    end
  end

  @doc """
  Sends a message in a thread.
  """
  def send_message(thread_id, session, content) do
    user_id = session.id

    # Verify user is a participant
    participant_query =
      from(tp in ThreadParticipant,
        where: tp.thread_id == ^thread_id and tp.user_id == type(^user_id, :binary_id)
      )

    case Repo.one(participant_query) do
      nil ->
        {:error, :forbidden}

      _participant ->
        # Optional: Check connection status (only block if explicitly disconnected)
        case check_connection_status(thread_id) do
          {:error, :connection_not_active} ->
            {:error, :connection_not_active}

          _ ->
            # Get other participants to check their online status
            other_participants =
              from(tp in ThreadParticipant,
                where: tp.thread_id == ^thread_id and tp.user_id != type(^user_id, :binary_id)
              )
              |> Repo.all()

            # Check if any recipient is online using Presence
            initial_status =
              if Enum.any?(other_participants, fn p -> user_is_online?(p.user_id) end) do
                "delivered"
              else
                "sent"
              end

            # Allow messaging (either no connection request exists, or it's accepted)
            %Message{}
            |> Message.changeset(%{
              thread_id: thread_id,
              sender_id: user_id,
              content: content,
              status: initial_status
            })
            |> Repo.insert()
            |> case do
              {:ok, message} ->
                # Broadcast to thread channel with formatted message data
                BackendWeb.Endpoint.broadcast(
                  "thread:#{thread_id}",
                  "new_message",
                  %{
                    id: message.id,
                    thread_id: message.thread_id,
                    sender_id: message.sender_id,
                    content: message.content,
                    is_read: message.is_read,
                    status: message.status,
                    sent_at: message.inserted_at
                  }
                )

                # Also broadcast to all participants' user channels for chats list updates
                Enum.each(other_participants, fn participant ->
                  BackendWeb.Endpoint.broadcast(
                    "user:#{participant.user_id}",
                    "new_message_in_thread",
                    %{
                      thread_id: thread_id,
                      message: %{
                        id: message.id,
                        thread_id: message.thread_id,
                        sender_id: message.sender_id,
                        content: message.content,
                        is_read: message.is_read,
                        status: message.status,
                        sent_at: message.inserted_at
                      }
                    }
                  )
                end)

                {:ok, message}

              {:error, changeset} ->
                {:error, changeset}
            end
        end
    end
  end

  # Helper to check if a user is currently online (connected to their user channel)
  defp user_is_online?(user_id) do
    # user_id is a binary_id, convert to string for channel topic
    user_id_string = to_string(user_id)
    presence_list = BackendWeb.Presence.list("user:#{user_id_string}")
    map_size(presence_list) > 0
  end

  @doc """
  Marks all messages in a thread as read for the current user.
  """
  def mark_messages_as_read(thread_id, session) do
    user_id = session.id

    # Get the sender IDs before updating
    sender_ids =
      from(m in Message,
        where:
          m.thread_id == ^thread_id and m.sender_id != type(^user_id, :binary_id) and
            m.is_read == false,
        distinct: true,
        select: m.sender_id
      )
      |> Repo.all()

    from(m in Message,
      where:
        m.thread_id == ^thread_id and m.sender_id != type(^user_id, :binary_id) and
          m.is_read == false
    )
    |> Repo.update_all(set: [is_read: true, status: "read"])

    # Broadcast to all senders that their messages have been read
    Enum.each(sender_ids, fn sender_id ->
      BackendWeb.Endpoint.broadcast(
        "user:#{sender_id}",
        "messages_marked_as_read",
        %{
          thread_id: thread_id,
          reader_id: user_id
        }
      )
    end)

    :ok
  end

  @doc """
  Marks messages as delivered when recipient receives them.
  """
  def mark_messages_as_delivered(thread_id, session) do
    user_id = session.id

    from(m in Message,
      where:
        m.thread_id == ^thread_id and m.sender_id != type(^user_id, :binary_id) and
          m.status == "sent"
    )
    |> Repo.update_all(set: [status: "delivered"])

    :ok
  end

  @doc """
  Gets the other participant in a 1-on-1 thread.
  """
  def get_other_participant(thread_id, session) do
    user_id = session.id

    from(tp in ThreadParticipant,
      where: tp.thread_id == ^thread_id and tp.user_id != type(^user_id, :binary_id),
      join: u in User,
      on: u.id == tp.user_id,
      select: u
    )
    |> Repo.one()
  end

  @doc """
  Clears all messages in a thread if the user is a participant.
  """
  def clear_thread_messages(thread_id, session) do
    user_id = session.id

    # Verify user is a participant
    participant_query =
      from(tp in ThreadParticipant,
        where: tp.thread_id == ^thread_id and tp.user_id == type(^user_id, :binary_id)
      )

    case Repo.one(participant_query) do
      nil ->
        {:error, :unauthorized}

      _participant ->
        # Delete all messages in the thread
        from(m in Message, where: m.thread_id == ^thread_id)
        |> Repo.delete_all()

        {:ok, :cleared}
    end
  end

  @doc """
  Checks if a connection between two users is active.
  Returns the connection request if found and accepted.
  """
  def check_connection_status(thread_id) do
    alias Backend.Connections.ConnectionRequest

    # First check if there's an accepted connection (prioritize accepted status)
    accepted_request =
      from(cr in ConnectionRequest,
        where: cr.thread_id == ^thread_id and cr.status == "accepted",
        limit: 1
      )
      |> Repo.one()

    case accepted_request do
      nil ->
        # No accepted connection, check if there's any other connection request
        any_request =
          from(cr in ConnectionRequest,
            where: cr.thread_id == ^thread_id,
            limit: 1
          )
          |> Repo.one()

        case any_request do
          nil -> {:ok, nil}
          _request -> {:error, :connection_not_active}
        end

      request ->
        {:ok, request}
    end
  end
end
