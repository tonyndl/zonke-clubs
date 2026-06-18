defmodule BackendWeb.API.DJScheduleJSON do
  alias Backend.DJs.DJSchedule

  def index(%{schedules: schedules}) do
    %{schedules: Enum.map(schedules, &data/1)}
  end

  def show(%{schedule: schedule}) do
    %{schedule: data(schedule)}
  end

  defp data(%DJSchedule{} = schedule) do
    dj_loaded = Ecto.assoc_loaded?(schedule.dj) and not is_nil(schedule.dj)
    dj_user_loaded = Ecto.assoc_loaded?(schedule.dj_user) and not is_nil(schedule.dj_user)

    %{
      id: schedule.id,
      # Legacy DJ (club-created)
      dj_id: schedule.dj_id,
      dj_name: cond do
        dj_user_loaded -> schedule.dj_user.username
        dj_loaded -> schedule.dj.name
        true -> nil
      end,
      dj_instagram: cond do
        dj_user_loaded -> schedule.dj_user.dj_instagram
        dj_loaded -> schedule.dj.instagram
        true -> nil
      end,
      dj_tiktok: cond do
        dj_user_loaded -> schedule.dj_user.dj_tiktok
        dj_loaded -> schedule.dj.tiktok
        true -> nil
      end,
      # DJ user account
      dj_user_id: schedule.dj_user_id,
      dj_user_avatar: if(dj_user_loaded, do: schedule.dj_user.avatar_url, else: nil),
      dj_user_soundcloud: if(dj_user_loaded, do: schedule.dj_user.dj_soundcloud, else: nil),
      dj_user_genres: if(dj_user_loaded, do: schedule.dj_user.dj_genres || [], else: []),
      day_of_week: schedule.day_of_week,
      day: day_name(schedule.day_of_week),
      start_time: format_time(schedule.start_time),
      end_time: format_time(schedule.end_time),
      notes: schedule.notes,
      type: schedule.type,
      specific_date: schedule.specific_date,
      inserted_at: schedule.inserted_at,
      updated_at: schedule.updated_at
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

  defp format_time(%Time{} = time) do
    "#{String.pad_leading(to_string(time.hour), 2, "0")}:#{String.pad_leading(to_string(time.minute), 2, "0")}"
  end
end
