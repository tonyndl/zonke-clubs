defmodule Backend.Repo.Migrations.AddStatusToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :status, :string, default: "sent", null: false
    end

    # Update existing messages based on is_read field
    execute """
            UPDATE messages
            SET status = CASE
              WHEN is_read = true THEN 'read'
              ELSE 'sent'
            END
            """,
            ""

    create index(:messages, [:status])
  end
end
