defmodule Backend.Workers.ExpiredRequestsCleanupWorker do
  use Oban.Worker, queue: :scheduled_tasks, max_attempts: 3

  import Ecto.Query
  alias Backend.Repo
  alias Backend.Connections.ConnectionRequest
  alias Backend.Intentions.Intention
  alias Backend.Admin.Event
  require Logger

  @impl Oban.Worker
  def perform(_job) do
    today = Date.utc_today()

    # 1. Delete pending connection requests whose intention date has passed
    {requests_count, _} =
      ConnectionRequest
      |> join(:inner, [cr], i in assoc(cr, :intention))
      |> where([cr, _i], cr.status == "pending")
      |> where([_cr, i], i.planned_date < ^today)
      |> Repo.delete_all()

    # 2. Delete intentions whose planned date has passed
    {intentions_count, _} =
      Intention
      |> where([i], i.planned_date < ^today)
      |> Repo.delete_all()

    # 3. Delete events whose date has passed
    {events_count, _} =
      Event
      |> where([e], e.date < ^today)
      |> Repo.delete_all()

    if requests_count + intentions_count + events_count > 0 do
      Logger.info(
        "[ExpiredCleanup] Deleted #{requests_count} expired request(s), " <>
          "#{intentions_count} expired intention(s), #{events_count} past event(s)"
      )
    end

    :ok
  end
end
