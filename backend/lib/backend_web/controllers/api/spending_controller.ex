defmodule BackendWeb.API.SpendingController do
  @moduledoc """
  User-facing controller for viewing spending records.
  """
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Spending.SpendingRecords

  @doc """
  Gets the current user's spending history across all clubs.
  """
  def history(conn, params, session) do
    limit = Map.get(params, "limit")
    opts = if limit, do: [limit: String.to_integer(limit)], else: []

    # Get all spending records for the current user
    spending_records = SpendingRecords.get_user_spending_all_clubs(session.id, opts)

    conn
    |> put_status(:ok)
    |> render(:index, spending_records: spending_records)
  end

  @doc """
  Gets the current user's spending history for a specific club.
  """
  def club_history(conn, %{"club_id" => club_id} = params, session) do
    limit = Map.get(params, "limit")
    opts = if limit, do: [limit: String.to_integer(limit)], else: []

    spending_records = SpendingRecords.get_user_spending_history(session.id, club_id, opts)

    conn
    |> put_status(:ok)
    |> render(:index, spending_records: spending_records)
  end

  @doc """
  Gets the current user's overall spending statistics.
  """
  def stats(conn, _params, session) do
    stats = SpendingRecords.get_user_stats(session.id)

    conn
    |> put_status(:ok)
    |> json(stats)
  end

  @doc """
  Gets the current user's spending statistics for a specific club.
  """
  def club_stats(conn, %{"club_id" => club_id}, session) do
    stats = SpendingRecords.get_user_club_stats(session.id, club_id)

    conn
    |> put_status(:ok)
    |> json(stats)
  end
end
