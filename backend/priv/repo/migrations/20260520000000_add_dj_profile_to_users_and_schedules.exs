defmodule Backend.Repo.Migrations.AddDjProfileToUsersAndSchedules do
  use Ecto.Migration

  def change do
    # Add DJ profile fields to users table
    alter table(:users) do
      add :dj_instagram, :string
      add :dj_tiktok, :string
      add :dj_soundcloud, :string
      add :dj_genres, {:array, :string}, default: []
    end

    # Add dj_user_id to dj_schedules (references a User with role=dj)
    alter table(:dj_schedules) do
      add :dj_user_id, references(:users, type: :binary_id, on_delete: :nilify_all)
    end

    # Make dj_id nullable so schedules can reference either a legacy DJ or a DJ user
    alter table(:dj_schedules) do
      modify :dj_id, :binary_id, null: true
    end

    create index(:dj_schedules, [:dj_user_id])
  end
end
