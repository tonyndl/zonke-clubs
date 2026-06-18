defmodule Backend.Repo.Migrations.CreateClubsTable do
  use Ecto.Migration

  def change do
    create table(:clubs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :email, :string
      add :phone, :string
      add :description, :text
      add :location, :map, null: false
      add :active, :boolean, default: true
      add :vibes, {:array, :string}, default: []
      add :music_genres, {:array, :string}, default: []
      add :dress_code, :string
      add :entry_fee, :string
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:clubs, [:name])
    create index(:clubs, [:user_id])
    create index(:clubs, [:active])
  end
end
