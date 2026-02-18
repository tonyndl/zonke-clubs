defmodule Backend.Repo.Migrations.MakePostsMediaFieldsNullable do
  use Ecto.Migration

  def change do
    alter table(:posts) do
      modify :media_type, :string, null: true, from: {:string, null: false}
      modify :media_url, :string, null: true, from: {:string, null: false}
    end
  end
end
