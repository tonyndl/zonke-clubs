defmodule Backend.Messenger.Queries.ThreadBy do
  alias Backend.Messenger.Schemas.Thread

  import Ecto.Query

  def base_query() do
    from(t in Thread,
      as: :thread
    )
  end

  def by_id(query, thread_id) do
    query
    |> where([thread: t], t.id == ^thread_id)
  end

  def by_participant(query, participant_id) do
    query
    |> join(:inner, [thread: t], tp in assoc(t, :thread_participants), as: :thread_participants)
    |> where([thread_participants: tp], tp.participant_id == ^participant_id)
  end
end
