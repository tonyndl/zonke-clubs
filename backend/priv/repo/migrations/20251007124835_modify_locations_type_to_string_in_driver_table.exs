defmodule Backend.Repo.Migrations.ModifyLocationsTypeToStringInDriverTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:location, :map)
      add(:location, :string)
    end
  end
end
