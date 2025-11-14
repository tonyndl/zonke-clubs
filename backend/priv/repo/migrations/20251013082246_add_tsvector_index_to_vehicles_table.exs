defmodule Backend.Repo.Migrations.AddTsvectorIndexToVehiclesTable do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE vehicles DROP COLUMN IF EXISTS searchable_document;"

    execute """
     ALTER TABLE vehicles
     ADD COLUMN searchable_document tsvector
     GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(brand, '')) ||
      to_tsvector('english', coalesce(model, ''))
    ) STORED;
    """

    flush()

    execute """
      CREATE INDEX vehicles_searchable_idx ON vehicles USING gin(searchable_document);
    """
  end

  def down do
    alter table(:vehicles) do
      remove(:searchable_document)
    end
  end
end
