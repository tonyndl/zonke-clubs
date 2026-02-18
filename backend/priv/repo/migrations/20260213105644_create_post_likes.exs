defmodule Backend.Repo.Migrations.CreatePostLikes do
  use Ecto.Migration

  def change do
    create table(:post_likes, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :post_id, references(:posts, type: :binary_id, on_delete: :delete_all), null: false

      timestamps()
    end

    # Ensure a user can only like a post once
    create unique_index(:post_likes, [:user_id, :post_id])
    # Index for querying likes by post
    create index(:post_likes, [:post_id])
  end
end
