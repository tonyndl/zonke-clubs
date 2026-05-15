defmodule Backend.Repo.Migrations.RemoveMusicGenresFromClubs do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      remove :music_genres
    end
  end
end
