defmodule Backend.DateTimeHelper do
  @moduledoc """
  Formats UTC NaiveDateTime values into display strings using the server's
  OS timezone (via Erlang's :calendar), so clients receive pre-formatted
  local-time strings with no client-side timezone conversion needed.
  """

  @months ~w(Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec)

  @doc """
  Formats a UTC NaiveDateTime for display:
  - Today's messages: "HH:MM" (e.g. "14:30")
  - Older messages:   "D Mon" (e.g. "4 Mar")
  """
  def format_display_time(nil), do: ""

  def format_display_time(%NaiveDateTime{} = naive_dt) do
    erl_utc = NaiveDateTime.to_erl(naive_dt)
    {{y, m, d}, {hour, min, _sec}} = :calendar.universal_time_to_local_time(erl_utc)

    {{ty, tm, td}, _} = :calendar.local_time()

    if {y, m, d} == {ty, tm, td} do
      "#{pad(hour)}:#{pad(min)}"
    else
      "#{d} #{Enum.at(@months, m - 1)}"
    end
  end

  defp pad(n), do: String.pad_leading(to_string(n), 2, "0")
end
