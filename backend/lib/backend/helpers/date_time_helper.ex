defmodule Backend.DateTimeHelper do
  def date_time(date) do
    current_date = Date.utc_today()

    case current_date == NaiveDateTime.to_date(date) do
      true ->
        date
        |> NaiveDateTime.to_time()
        |> Time.to_string()
        |> String.slice(0, 5)

      false ->
        date
        |> Calendar.strftime("%-d %b")
    end
  end
end
