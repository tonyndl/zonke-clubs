defmodule Backend.Repo.Migrations.CreateIntentionsTable do
  use Ecto.Migration

  def change do
    create table(:intentions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :activity_type, :string, null: false
      add :planned_date, :date, null: false
      add :planned_time, :string
      add :message, :text
      add :active, :boolean, default: true, null: false
      add :expires_at, :utc_datetime
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:intentions, [:club_id])
    create index(:intentions, [:user_id])
    create index(:intentions, [:active])
    create index(:intentions, [:planned_date])
  end
end
