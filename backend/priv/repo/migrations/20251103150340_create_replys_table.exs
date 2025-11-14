defmodule Backend.Repo.Migrations.CreateReplysTable do
  use Ecto.Migration

  def change do
    create table(:replys, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:comment, :text)

      add(:author_id, references(:users, type: :uuid), null: false)
      add(:driver_id, references(:drivers, type: :uuid, on_delete: :delete_all))
    end
  end
end
