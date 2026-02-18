defmodule Backend.Repo.Migrations.UpdateClubsLocationToMap do
  use Ecto.Migration

  def up do
    # Change column type from text to map (jsonb) with USING clause
    # This automatically converts existing string values to JSON format
    execute """
    ALTER TABLE clubs
    ALTER COLUMN location TYPE jsonb
    USING jsonb_build_object('name', location::text)
    """
  end

  def down do
    # Extract name field from map and convert back to text
    execute """
    ALTER TABLE clubs
    ALTER COLUMN location TYPE text
    USING location->>'name'
    """
  end
end
