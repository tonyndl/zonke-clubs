defmodule Backend.Repo.Migrations.AddThreadIdToConnectionRequests do
  use Ecto.Migration

  def change do
    alter table(:connection_requests) do
      add :thread_id, references(:threads, type: :binary_id, on_delete: :nilify_all)
    end

    create index(:connection_requests, [:thread_id])
  end
end
