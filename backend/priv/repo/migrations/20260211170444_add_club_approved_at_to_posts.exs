defmodule Backend.Repo.Migrations.AddClubApprovedAtToPosts do
  use Ecto.Migration

  def change do
    alter table(:posts) do
      add :club_approved_at, :naive_datetime
    end

    create index(:posts, [:club_approved_at])
  end
end
