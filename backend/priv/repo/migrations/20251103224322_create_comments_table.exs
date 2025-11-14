defmodule Backend.Repo.Migrations.CreateCommentsTable do
  use Ecto.Migration

  def change do
    create table(:comments, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:text, :text)

      add(:author_id, references(:users, type: :uuid), null: false)
      add(:driver_id, references(:drivers, type: :uuid, on_delete: :delete_all))

      timestamps()
    end
  end
end
