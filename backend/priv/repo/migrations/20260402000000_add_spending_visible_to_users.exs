defmodule Backend.Repo.Migrations.AddSpendingVisibleToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :spending_visible, :boolean, default: true, null: false
    end
  end
end
