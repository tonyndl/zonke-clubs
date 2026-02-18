defmodule Backend.Repo.Migrations.AddPostIdToAssets do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      add(:post_id, references(:posts, type: :binary_id, on_delete: :delete_all))
    end

    create index(:assets, [:post_id])
  end
end
