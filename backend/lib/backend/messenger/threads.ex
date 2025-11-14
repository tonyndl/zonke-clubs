defmodule Backend.Messenger.Threads do
  alias Ecto.Multi
  alias Backend.{Repo, PaginateHelper}
  alias Backend.Messenger.Schemas.{ThreadParticipant, Thread, Participant, Message}
  alias Backend.Messenger.Messages
  alias Backend.Messenger.Queries.ThreadBy
  alias Backend.Assets.Asset

  import Ecto.Query

  @preloads [:messages, [thread_participants: :participant]]

  def put_message_in_new_thread(params, user_id) do
    case Messages.create(params, user_id) do
      {:ok, message} ->
        {:ok, thread} = get_thread(message.thread_id)
        IO.inspect(thread, label: "AAAAAAAAAAAAAAAAAAAAA")
        updated_thread = Map.merge(thread, %{last_message: message, unseen_msg_count: 1})
        {:ok, updated_thread}

      {:error, error} ->
        {:error, error}
    end
  end

  def get_thread(id, :plain) do
    Repo.get(Thread, id)
    |> Repo.preload(@preloads)
    |> format_thread()
  end

  def get_thread(id) do
    Repo.get(Thread, id)
    |> prepare_thread()
  end

  def prepare_thread(thread) do
    prepared_thread =
      thread
      |> Repo.preload(
        thread_participants:
          {from(tp in ThreadParticipant,
             join: p in assoc(tp, :participant),
             join: a in Asset,
             on: p.id == a.user_id,
             select: %ThreadParticipant{
               id: tp.id,
               participant: %Participant{
                 id: p.id,
                 first_name: p.first_name,
                 last_name: p.last_name,
                 asset_filename: a.filename
               }
             }
           ), []}
      )
      |> format_thread()
  end

  def get_participant_thread_ids(participant_id) do
    ThreadBy.base_query()
    |> ThreadBy.by_participant(participant_id)
    |> select([thread: t], t.id)
    |> Repo.all()
  end

  def get_participant_threads(params, %{user_id: participant_id}) do
    unseen_messages_count_subquery =
      from(m in Message,
        where:
          m.seen == false and
            m.author_id != ^participant_id and
            m.thread_id == parent_as(:thread).id,
        select: %{count: count(m.id)}
      )

    last_message_subquery =
      from(m in Message,
        where: m.thread_id == parent_as(:thread).id,
        order_by: [desc: m.inserted_at],
        limit: 1
      )

    data =
      ThreadBy.base_query()
      |> ThreadBy.by_participant(participant_id)
      |> build_search(params, participant_id)
      |> join(:left_lateral, [thread: t], uc in subquery(unseen_messages_count_subquery),
        as: :unseen_count,
        on: true
      )
      |> join(:left_lateral, [thread: t], lm in subquery(last_message_subquery),
        as: :last_message,
        on: true
      )
      |> select_merge([thread: t, unseen_count: uc, last_message: lm], %{
        t
        | last_message: lm,
          unseen_msg_count: coalesce(uc.count, 0)
      })
      |> order_by([last_message: lm], desc_nulls_last: lm.inserted_at)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    threads =
      Repo.preload(data.entries,
        thread_participants:
          {from(tp in ThreadParticipant,
             join: p in assoc(tp, :participant),
             join: a in Asset,
             on: p.id == a.user_id,
             select: %ThreadParticipant{
               id: tp.id,
               participant: %Participant{
                 id: p.id,
                 first_name: p.first_name,
                 last_name: p.last_name,
                 asset_filename: a.filename
               }
             }
           ), []}
      )

    {:ok, threads, PaginateHelper.prep_paginate(data)}
  end

  defp build_search(query, params, participant_id) do
    filters = Map.get(params, :filters, %{})

    Enum.reduce(filters, query, fn
      {:search_term, value}, query when is_binary(value) and value != "" ->
        # Joining the thread_participants again but aliasing it as :other_tp and excluding the current participant
        query
        |> join(:inner, [thread: t], other_tp in assoc(t, :thread_participants), as: :other_tp)
        |> where([other_tp: otp], otp.participant_id != ^participant_id)
        |> join(:inner, [other_tp: otp], p in assoc(otp, :participant), as: :participant)
        |> where(
          [participant: p],
          ilike(p.first_name, ^"%#{value}%") or
            ilike(p.last_name, ^"%#{value}%")
        )

      _, query ->
        query
    end)
  end

  def find_thread_between(participant_ids) when is_list(participant_ids) do
    [p1, p2] = participant_ids

    query =
      from(tp1 in ThreadParticipant,
        join: tp2 in ThreadParticipant,
        on: tp1.thread_id == tp2.thread_id,
        where: tp1.participant_id == ^p1 and tp2.participant_id == ^p2,
        select: tp1.thread_id,
        limit: 1
      )

    Repo.one(query)
  end

  def initialize_thread(participant_id, user_id) do
    case find_thread_between([participant_id, user_id]) do
      nil ->
        create_thread(participant_id, user_id)

      thread_id ->
        get_thread(thread_id)
    end
  end

  def create_thread(participant_id, user_id) do
    Multi.new()
    |> Multi.insert(
      :thread,
      Thread.changeset(%Thread{}, %{})
    )
    |> Multi.run(:thread_participants, fn _, %{thread: thread} ->
      with [ok: tp_1, ok: tp_2] <- ThreadParticipant.create(thread, [participant_id, user_id]) do
        IO.inspect([tp_1, tp_2], label: "2222222222222222")
        {:ok, [tp_1, tp_2]}
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{thread: thread}} ->
        prepare_thread(thread)

      {:error, reason, failed_value, _changes} ->
        {:error, {reason, failed_value}}
    end
  end

  def mark_messages_as_seen(thread_id) do
    {count, _} =
      from(m in Message,
        where: m.thread_id == ^thread_id,
        where: m.seen == false,
        update: [set: [seen: true]]
      )
      |> Repo.update_all([])

    {:ok, count}
  end

  def delete(thread) do
    Repo.delete(thread)
  end

  def format_thread(%Thread{} = thread), do: {:ok, thread}
  def format_thread(nil), do: {:error, :not_found}
end
