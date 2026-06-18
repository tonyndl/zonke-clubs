defmodule Backend.Repo.Migrations.CreateStrobeSessions do
  use Ecto.Migration

  def change do
    create table(:strobe_sessions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :dj_user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      add :bpm, :integer, null: false, default: 120
      add :effect, :string, null: false, default: "beat"
      add :status, :string, null: false, default: "active"
      add :started_at, :utc_datetime, null: false

      timestamps()
    end

    create index(:strobe_sessions, [:dj_user_id])
    create index(:strobe_sessions, [:club_id])
    create index(:strobe_sessions, [:status])
  end
end
