defmodule Backend.Repo.Migrations.MakePostsUserIdNullable do
  use Ecto.Migration

  def change do
    # Make user_id nullable in posts table to allow club admin posts
    alter table(:posts) do
      modify :user_id, :binary_id, null: true
    end
  end
end
