defmodule Backend.Repo.Migrations.AddUniqueIndexToIntentions do
  use Ecto.Migration

  def change do
    # Delete duplicate intentions, keeping only the most recently inserted one
    # per (user_id, club_id, planned_date)
    execute(
      """
      DELETE FROM intentions
      WHERE id NOT IN (
        SELECT DISTINCT ON (user_id, club_id, planned_date) id
        FROM intentions
        ORDER BY user_id, club_id, planned_date, inserted_at DESC
      )
      """,
      # down: nothing to undo for the delete
      ""
    )

    create unique_index(:intentions, [:user_id, :club_id, :planned_date])
  end
end
