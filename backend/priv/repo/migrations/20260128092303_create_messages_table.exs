defmodule Backend.Repo.Migrations.CreateMessagesTable do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :thread_id, references(:threads, type: :binary_id, on_delete: :delete_all), null: false
      add :sender_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :content, :text, null: false
      add :is_read, :boolean, default: false, null: false

      timestamps()
    end

    create index(:messages, [:thread_id])
    create index(:messages, [:sender_id])
    create index(:messages, [:inserted_at])
  end
end
