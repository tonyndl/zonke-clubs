defmodule Backend.Repo.Migrations.RemoveVibesFromClubsAndUsers do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      remove :vibes
    end

    alter table(:users) do
      remove :vibes
    end
  end
end
