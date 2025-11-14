defmodule Backend.Repo.Migrations.RemoveLocationFieldsInDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:location)
      remove(:location_options)
    end
  end
end
