defmodule Backend.Repo.Migrations.AddTimestampsToReplysTable do
  use Ecto.Migration

  def change do
    alter table(:replys) do
      timestamps()
    end
  end
end
