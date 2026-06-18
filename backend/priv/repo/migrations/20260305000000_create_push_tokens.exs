defmodule Backend.Repo.Migrations.CreatePushTokens do
  use Ecto.Migration

  def change do
    create table(:push_tokens, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :expo_push_token, :string, null: false
      add :platform, :string
      add :device_id, :string

      timestamps()
    end

    create unique_index(:push_tokens, [:expo_push_token])
    create index(:push_tokens, [:user_id])
  end
end
