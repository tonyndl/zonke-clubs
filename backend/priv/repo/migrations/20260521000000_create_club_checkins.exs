defmodule Backend.Repo.Migrations.CreateClubCheckins do
  use Ecto.Migration

  def change do
    create table(:club_checkins, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      add :is_open, :boolean, default: true, null: false
      add :expires_at, :utc_datetime

      timestamps()
    end

    create unique_index(:club_checkins, [:user_id, :club_id])
    create index(:club_checkins, [:club_id, :is_open])
    create index(:club_checkins, [:user_id])
  end
end
