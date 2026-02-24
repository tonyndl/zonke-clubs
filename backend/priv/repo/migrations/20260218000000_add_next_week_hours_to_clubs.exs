defmodule Backend.Repo.Migrations.AddNextWeekHoursToClubs do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      add :next_week_hours, :map, default: %{}
    end
  end
end
