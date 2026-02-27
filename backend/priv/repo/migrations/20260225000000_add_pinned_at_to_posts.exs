defmodule Backend.Repo.Migrations.AddPinnedAtToPosts do
  use Ecto.Migration

  def change do
    alter table(:posts) do
      add :pinned_at, :naive_datetime, default: nil
    end
  end
end
