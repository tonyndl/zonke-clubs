defmodule BackendWeb.API.SpendingJSON do
  @moduledoc """
  JSON views for user-facing spending records.
  """

  def index(%{spending_records: spending_records}) do
    %{spending_records: Enum.map(spending_records, &data/1)}
  end

  def show(%{spending_record: spending_record}) do
    %{spending_record: data(spending_record)}
  end

  defp data(spending_record) do
    %{
      id: spending_record.id,
      club_id: spending_record.club_id,
      amount: spending_record.amount,
      visit_date: spending_record.visit_date,
      notes: spending_record.notes,
      group_outing_id: spending_record.group_outing_id,
      inserted_at: spending_record.inserted_at,
      updated_at: spending_record.updated_at,
      # Include preloaded club data if available
      club: club_data(spending_record)
    }
  end

  defp club_data(%{club: %Ecto.Association.NotLoaded{}}), do: nil

  defp club_data(%{club: club}) when not is_nil(club) do
    %{
      id: club.id,
      name: club.name,
      location: club.location
    }
  end

  defp club_data(_), do: nil
end
