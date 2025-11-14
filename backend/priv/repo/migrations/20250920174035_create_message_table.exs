defmodule Backend.Repo.Migrations.CreateMessageTable do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:content, :text, null: false)
      add(:visible, :boolean)
      add(:sent_at, :naive_datetime)
      add(:created_at, :naive_datetime)
      add(:metadata, :map)
      add(:seen, :boolean, default: false)

      add(:thread_id, references(:threads, type: :uuid, on_delete: :delete_all), null: false)
      add(:author_id, references(:users, type: :uuid, on_delete: :nothing), null: false)
      add(:recipient_id, references(:users, type: :uuid, on_delete: :nothing))

      timestamps()
    end

    create(index(:messages, [:thread_id]))
  end
end
