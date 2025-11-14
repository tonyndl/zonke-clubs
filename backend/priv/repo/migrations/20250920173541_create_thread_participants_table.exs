defmodule Backend.Repo.Migrations.CreateThreadParticipantsTable do
  use Ecto.Migration

  def change do
    create table(:thread_participants, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:thread_id, references(:threads, type: :uuid, on_delete: :delete_all), null: false)
      add(:participant_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end

    create unique_index(:thread_participants, [:thread_id, :participant_id], name: :unique_thread_participants_idx)
  end
end
