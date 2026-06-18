defmodule Backend.Repo.Migrations.CreateDjsTable do
  use Ecto.Migration

  def change do
    create table(:djs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :genre, :string
      add :bio, :text
      add :instagram, :string
      add :soundcloud, :string
      add :image_url, :string
      add :club_id, references(:clubs, on_delete: :delete_all, type: :binary_id), null: false

      timestamps()
    end

    create index(:djs, [:club_id])
  end
end
