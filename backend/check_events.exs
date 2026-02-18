# Check events and why they might not be counted
import Ecto.Query
alias Backend.Repo
alias Backend.Admin.Event

# Get all events
all_events = Repo.all(Event)
IO.puts("\n📅 Total events in database: #{length(all_events)}")

if length(all_events) > 0 do
  IO.puts("\nEvent details:")
  Enum.each(all_events, fn event ->
    today = Date.utc_today()
    is_upcoming = Date.compare(event.date, today) != :lt
    
    IO.puts("\n---")
    IO.puts("  Title: #{event.title}")
    IO.puts("  Date: #{event.date}")
    IO.puts("  Status: #{event.status}")
    IO.puts("  Admin ID: #{event.admin_id}")
    IO.puts("  Is upcoming? #{is_upcoming}")
    IO.puts("  Will count? #{event.status == "published" and is_upcoming}")
  end)
  
  # Count upcoming published events
  today = Date.utc_today()
  upcoming_published = Event
    |> where([e], e.status == "published" and e.date >= ^today)
    |> Repo.aggregate(:count)
  
  IO.puts("\n✅ Upcoming published events: #{upcoming_published}")
else
  IO.puts("\n❌ No events found in database")
end
