defmodule BackendWeb.API.DJProfileJSON do
  alias Backend.Accounts.User

  def index(%{djs: djs}) do
    %{djs: Enum.map(djs, &data/1)}
  end

  def show(%{dj: dj}) do
    %{dj: data(dj)}
  end

  def my_schedules(%{schedules: schedules}) do
    %{schedules: Enum.map(schedules, &schedule_data/1)}
  end

  defp schedule_data(schedule) do
    club_loaded = Ecto.assoc_loaded?(schedule.club) and not is_nil(schedule.club)

    %{
      id: schedule.id,
      type: schedule.type,
      day_of_week: schedule.day_of_week,
      day: day_name(schedule.day_of_week),
      specific_date: schedule.specific_date,
      start_time: format_time(schedule.start_time),
      end_time: format_time(schedule.end_time),
      notes: schedule.notes,
      club_id: schedule.club_id,
      club_name: if(club_loaded, do: schedule.club.name, else: nil),
      club_location: if(club_loaded, do: schedule.club.location, else: nil),
      inserted_at: schedule.inserted_at
    }
  end

  defp day_name(0), do: "Sun"
  defp day_name(1), do: "Mon"
  defp day_name(2), do: "Tue"
  defp day_name(3), do: "Wed"
  defp day_name(4), do: "Thu"
  defp day_name(5), do: "Fri"
  defp day_name(6), do: "Sat"
  defp day_name(_), do: nil

  defp format_time(nil), do: nil
  defp format_time(%Time{} = t),
    do: "#{String.pad_leading(to_string(t.hour), 2, "0")}:#{String.pad_leading(to_string(t.minute), 2, "0")}"

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      dj_instagram: user.dj_instagram,
      dj_tiktok: user.dj_tiktok,
      dj_soundcloud: user.dj_soundcloud,
      dj_genres: user.dj_genres || [],
      dj_handles: user.dj_handles || []
    }
  end
end
