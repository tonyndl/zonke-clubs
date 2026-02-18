defmodule BackendWeb.Admin.SpendingRecordJSON do
  @moduledoc """
  JSON views for spending records.
  """

  def index(%{spending_records: spending_records}) do
    %{spending_records: Enum.map(spending_records, &data/1)}
  end

  def show(%{spending_record: spending_record}) do
    %{spending_record: data(spending_record)}
  end

  def leaderboard(%{leaderboard: leaderboard}) do
    %{leaderboard: Enum.map(leaderboard, &leaderboard_data/1)}
  end

  defp data(spending_record) do
    %{
      id: spending_record.id,
      club_id: spending_record.club_id,
      user_id: spending_record.user_id,
      amount: spending_record.amount,
      visit_date: spending_record.visit_date,
      notes: spending_record.notes,
      group_outing_id: spending_record.group_outing_id,
      paid_by_user_id: spending_record.paid_by_user_id,
      split_type: spending_record.split_type,
      original_amount: spending_record.original_amount,
      participant_ids: spending_record.participant_ids,
      inserted_at: spending_record.inserted_at,
      updated_at: spending_record.updated_at,
      # Include preloaded user data if available
      user: user_data(spending_record)
    }
  end

  defp user_data(%{user: %Ecto.Association.NotLoaded{}}), do: nil

  defp user_data(%{user: user}) when not is_nil(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end

  defp user_data(_), do: nil

  defp leaderboard_data(entry) do
    %{
      rank: entry.rank,
      user_id: entry.user_id,
      username: entry.username,
      avatar_url: entry.avatar_url,
      amount: entry.amount,
      visit_date: entry.visit_date,
      position_change: entry.position_change,
      time_on_chart: entry.time_on_chart,
      time_unit: entry.time_unit
    }
  end
end
