defmodule Backend.Repo.Migrations.CreateClubLikesTable do
  use Ecto.Migration

  def change do
    create table(:club_likes, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:club_likes, [:user_id])
    create index(:club_likes, [:club_id])
    create unique_index(:club_likes, [:user_id, :club_id])
  end
end
