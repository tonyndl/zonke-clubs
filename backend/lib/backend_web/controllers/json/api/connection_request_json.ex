defmodule BackendWeb.API.ConnectionRequestJSON do
  @moduledoc """
  JSON views for ConnectionRequest resources.
  """

  def index(%{requests: requests}) do
    %{requests: Enum.map(requests, &data/1)}
  end

  def show(%{request: request}) do
    %{request: data(request)}
  end

  defp data(request) do
    %{
      id: request.id,
      status: request.status,
      message: request.message,
      club_id: request.club_id,
      club_name: if(request.club, do: request.club.name, else: nil),
      intention_id: request.intention_id,
      planned_date: if(request.intention, do: request.intention.planned_date, else: nil),
      thread_id: request.thread_id,
      sender: user_data(request.sender),
      receiver: user_data(request.receiver),
      created_at: format_datetime(request.inserted_at),
      updated_at: format_datetime(request.updated_at)
    }
  end

  defp user_data(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio
    }
  end

  defp format_datetime(nil), do: nil

  defp format_datetime(datetime) do
    datetime
    |> DateTime.from_naive!("Etc/UTC")
    |> DateTime.to_iso8601()
  end
end
