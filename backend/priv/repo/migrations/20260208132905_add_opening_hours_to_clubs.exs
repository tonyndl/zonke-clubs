defmodule Backend.Repo.Migrations.AddOpeningHoursToClubs do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      add :opening_hours, :map, default: %{}
    end
  end
end
