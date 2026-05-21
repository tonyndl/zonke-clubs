defmodule Backend.Repo.Migrations.AddDjHandlesToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :dj_handles, {:array, :map}, default: []
    end
  end
end
