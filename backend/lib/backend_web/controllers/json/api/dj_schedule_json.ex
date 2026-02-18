defmodule BackendWeb.API.DJScheduleJSON do
  alias Backend.DJs.DJSchedule

  def index(%{schedules: schedules}) do
    %{schedules: Enum.map(schedules, &data/1)}
  end

  def show(%{schedule: schedule}) do
    %{schedule: data(schedule)}
  end

  defp data(%DJSchedule{} = schedule) do
    %{
      id: schedule.id,
      dj_id: schedule.dj_id,
      dj_name: if(Ecto.assoc_loaded?(schedule.dj), do: schedule.dj.name, else: nil),
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
