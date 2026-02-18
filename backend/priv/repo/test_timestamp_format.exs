naive = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
dt = DateTime.from_naive!(naive, "Etc/UTC")
iso = DateTime.to_iso8601(dt)

IO.puts("NaiveDateTime: #{inspect(naive)}")
IO.puts("DateTime: #{inspect(dt)}")
IO.puts("ISO8601: #{iso}")
IO.puts("\nDoes it end with Z? #{String.ends_with?(iso, "Z")}")
