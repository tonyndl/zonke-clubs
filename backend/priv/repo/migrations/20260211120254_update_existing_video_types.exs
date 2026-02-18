defmodule Backend.Repo.Migrations.UpdateExistingVideoTypes do
  use Ecto.Migration

  def up do
    # Update all assets that have duration (which means they're videos)
    # to also have type = "video" in their meta field
    execute """
    UPDATE assets
    SET meta = jsonb_set(meta, '{type}', '"video"', true)
    WHERE meta->>'duration' IS NOT NULL
    AND meta->>'type' IS NULL;
    """

    # Update all assets without duration and without type to have type = "image"
    execute """
    UPDATE assets
    SET meta = jsonb_set(meta, '{type}', '"image"', true)
    WHERE meta->>'duration' IS NULL
    AND meta->>'type' IS NULL;
    """
  end

  def down do
    # Remove the type field from meta
    execute """
    UPDATE assets
    SET meta = meta - 'type';
    """
  end
end
