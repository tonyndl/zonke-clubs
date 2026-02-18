defmodule BackendWeb.API.IntentionJSON do
  @moduledoc """
  JSON views for Intention resources.
  """

  def index(%{intentions: intentions}) do
    %{intentions: Enum.map(intentions, &data/1)}
  end

  def show(%{intention: intention}) do
    %{intention: data(intention)}
  end

  defp data(intention) do
    %{
      id: intention.id,
      activity_type: intention.activity_type,
      club_id: intention.club_id,
      planned_date: intention.planned_date,
      planned_time: intention.planned_time,
      message: intention.message,
      active: intention.active,
      expires_at: intention.expires_at,
      user: user_data(intention.user),
      inserted_at: intention.inserted_at,
      updated_at: intention.updated_at
    }
  end

  defp user_data(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end
end
