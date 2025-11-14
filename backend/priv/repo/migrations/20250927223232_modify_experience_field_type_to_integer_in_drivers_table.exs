defmodule Backend.Repo.Migrations.ModifyExperienceFieldTypeToIntegerInDriversTable do
  use Ecto.Migration


  def up do
    execute "ALTER TABLE drivers ALTER COLUMN experience TYPE integer USING (experience::integer)"
  end

  def down do
    execute "ALTER TABLE drivers ALTER COLUMN experience TYPE varchar"
  end
end
