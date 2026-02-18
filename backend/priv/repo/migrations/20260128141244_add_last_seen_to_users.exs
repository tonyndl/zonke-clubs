defmodule Backend.Repo.Migrations.AddLastSeenToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :last_seen_at, :naive_datetime
    end

    # Set initial last_seen_at for existing users to current time
    execute "UPDATE users SET last_seen_at = NOW()", ""
  end
end
