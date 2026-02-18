defmodule Backend.Repo.Migrations.CreateConnectionRequestsTable do
  use Ecto.Migration

  def change do
    create table(:connection_requests, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :status, :string, null: false, default: "pending"
      add :message, :text
      add :sender_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :receiver_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :nilify_all)

      timestamps()
    end

    create index(:connection_requests, [:sender_id])
    create index(:connection_requests, [:receiver_id])
    create index(:connection_requests, [:status])
    create index(:connection_requests, [:club_id])
    create index(:connection_requests, [:inserted_at])
  end
end
