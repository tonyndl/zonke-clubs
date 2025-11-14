defmodule Backend.Repo.Migrations.AddDriverTsvectorSearch do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE drivers DROP COLUMN IF EXISTS searchable_document;"

    execute """
     ALTER TABLE drivers
     ADD COLUMN searchable_document tsvector
     GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(description, ''))
    ) STORED;
    """

    flush()

    execute """
      CREATE INDEX drivers_searchable_idx ON drivers USING gin(searchable_document);
    """
  end

  def down do
    alter table(:drivers) do
      remove(:searchable_document)
    end
  end
end
