defmodule Backend.Repo.Migrations.AddLocationToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      # Store location as jsonb map: %{name: string, latitude: float, longitude: float}
      add :location, :map
    end
  end
end
