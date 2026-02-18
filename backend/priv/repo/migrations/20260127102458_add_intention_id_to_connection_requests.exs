defmodule Backend.Repo.Migrations.AddIntentionIdToConnectionRequests do
  use Ecto.Migration

  def change do
    alter table(:connection_requests) do
      add :intention_id, references(:intentions, type: :binary_id, on_delete: :nilify_all)
    end

    create index(:connection_requests, [:intention_id])
  end
end
