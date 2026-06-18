defmodule Backend.Repo.Migrations.CreatePostsTable do
  use Ecto.Migration

  def change do
    create table(:posts, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      add :caption, :text
      add :media_type, :string, null: false  # "image" or "video"
      add :media_url, :text, null: false
      add :status, :string, default: "pending", null: false  # "pending", "approved", "rejected"

      timestamps()
    end

    create index(:posts, [:user_id])
    create index(:posts, [:club_id])
    create index(:posts, [:status])
    create index(:posts, [:inserted_at])
  end
end
