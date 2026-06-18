defmodule BackendWeb.Admin.SpendingRecordController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Spending.SpendingRecords

  @doc """
  Creates a spending record (single or group).
  Expects either a single record or an array of records for group spending.
  """
  def create(conn, %{"records" => records}, session) when is_list(records) do
    # Group spending - multiple records
    with {:ok, club_id} <- get_admin_club_id(session),
         attrs_list = Enum.map(records, fn record ->
           Map.merge(record, %{
             "club_id" => club_id,
             "visit_date" => record["visit_date"] || Date.utc_today()
           })
         end),
         {:ok, spending_records} <- SpendingRecords.create_group_spending(attrs_list) do
      conn
      |> put_status(:created)
      |> render(:index, spending_records: spending_records)
    end
  end

  def create(conn, %{"record" => record_params}, session) do
    # Single spending record
    with {:ok, club_id} <- get_admin_club_id(session),
         attrs = Map.merge(record_params, %{
           "club_id" => club_id,
           "visit_date" => record_params["visit_date"] || Date.utc_today()
         }),
         {:ok, spending_record} <- SpendingRecords.create_spending_record(attrs) do
      conn
      |> put_status(:created)
      |> render(:show, spending_record: spending_record)
    end
  end

  @doc """
  Lists all spending records for the admin's club.
  """
  def index(conn, params, session) do
    with {:ok, club_id} <- get_admin_club_id(session),
         limit = Map.get(params, "limit"),
         opts = if(limit, do: [limit: String.to_integer(limit)], else: []),
         spending_records = SpendingRecords.list_spending_records(club_id, opts) do
      conn
      |> put_status(:ok)
      |> render(:index, spending_records: spending_records)
    end
  end

  @doc """
  Gets the leaderboard for the admin's club.
  """
  def leaderboard(conn, params, session) do
    with {:ok, club_id} <- get_admin_club_id(session),
         limit = Map.get(params, "limit", "10"),
         time_period = Map.get(params, "time_period", "all") |> String.to_atom(),
         leaderboard = SpendingRecords.get_leaderboard(club_id, limit: String.to_integer(limit), time_period: time_period) do
      conn
      |> put_status(:ok)
      |> render(:leaderboard, leaderboard: leaderboard)
    end
  end

  @doc """
  Gets statistics for the admin's club.
  """
  def stats(conn, _params, session) do
    with {:ok, club_id} <- get_admin_club_id(session),
         stats = SpendingRecords.get_club_stats(club_id) do
      conn
      |> put_status(:ok)
      |> json(stats)
    end
  end

  @doc "Updates a spending record."
  def update(conn, %{"id" => id} = params, session) do
    with {:ok, _club_id} <- get_admin_club_id(session),
         {:ok, record} <- SpendingRecords.get_spending_record(id),
         attrs = Map.take(params, ["amount", "visit_date", "notes"]),
         {:ok, updated} <- SpendingRecords.update_spending_record(record, attrs) do
      conn
      |> put_status(:ok)
      |> render(:show, spending_record: updated)
    end
  end

  @doc "Deletes a spending record."
  def delete(conn, %{"id" => id}, session) do
    with {:ok, _club_id} <- get_admin_club_id(session),
         {:ok, record} <- SpendingRecords.get_spending_record(id),
         {:ok, _} <- SpendingRecords.delete_spending_record(record) do
      conn
      |> put_status(:no_content)
      |> json(%{})
    end
  end

  # Helper function to get the club_id from admin session
  defp get_admin_club_id(session) do
    # Query to find the club owned by this admin
    alias Backend.Clubs.Club
    alias Backend.Repo
    import Ecto.Query

    case Repo.one(from c in Club, where: c.admin_id == ^session.id, select: c.id) do
      nil -> {:error, :no_club_found}
      club_id -> {:ok, club_id}
    end
  end
end
