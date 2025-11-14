defmodule Backend.Repo.Migrations.CreateNotificationsTable do
  use Ecto.Migration

  def up do
    execute(
      "CREATE TYPE notifications_enum AS ENUM ('booking', 'review', 'tag', 'profile', 'payments', 'system')"
    )

    create table(:notifications, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:type, :notifications_enum)
      add(:read, :boolean, default: false)
      add(:metadata, :map)

      add(:recipient_id, references(:users, type: :uuid), null: false, on_delete: :delete_all)
      add(:notifier_id, references(:users, type: :uuid), null: false, on_delete: :delete_all)

      timestamps()
    end
  end

  def down do
    drop table(:notifications)
    execute("DROP TYPE notifications_enum")
  end
end
