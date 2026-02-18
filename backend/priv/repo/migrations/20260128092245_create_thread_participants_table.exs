defmodule Backend.Repo.Migrations.CreateThreadParticipantsTable do
  use Ecto.Migration

  def change do
    create table(:thread_participants, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :thread_id, references(:threads, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :last_read_at, :utc_datetime

      timestamps()
    end

    create index(:thread_participants, [:thread_id])
    create index(:thread_participants, [:user_id])
    create unique_index(:thread_participants, [:thread_id, :user_id])
  end
end
