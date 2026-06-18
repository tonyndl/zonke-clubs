# Publish all draft events with future dates
import Ecto.Query
alias Backend.Repo
alias Backend.Admin.Event

today = Date.utc_today()

# Find draft events with future dates
draft_events = Event
  |> where([e], e.status == "draft" and e.date >= ^today)
  |> Repo.all()

if length(draft_events) > 0 do
  IO.puts("📅 Publishing #{length(draft_events)} draft events with future dates...")
  
  Enum.each(draft_events, fn event ->
    event
    |> Ecto.Changeset.change(%{status: "published"})
    |> Repo.update()
    
    IO.puts("  ✅ Published: #{event.title}")
  end)
  
  IO.puts("\n✨ Done! Events are now published.")
else
  IO.puts("No draft events with future dates found.")
end
