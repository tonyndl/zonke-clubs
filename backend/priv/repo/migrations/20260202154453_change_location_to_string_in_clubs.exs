defmodule Backend.Repo.Migrations.ChangeLocationToStringInClubs do
  use Ecto.Migration

  def change do
    # Change location from jsonb (map) to text (string)
    alter table(:clubs) do
      modify :location, :text
    end
  end
end
