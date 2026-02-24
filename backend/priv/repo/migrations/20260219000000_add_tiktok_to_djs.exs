defmodule Backend.Repo.Migrations.AddTiktokToDjs do
  use Ecto.Migration

  def change do
    alter table(:djs) do
      add :tiktok, :string
    end
  end
end
