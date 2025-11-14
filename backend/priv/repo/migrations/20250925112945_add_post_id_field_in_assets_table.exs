defmodule Backend.Repo.Migrations.AddPostIdFieldInAssetsTable do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      add(:post_id, references(:posts, type: :uuid, on_delete: :delete_all))
    end
  end
end
