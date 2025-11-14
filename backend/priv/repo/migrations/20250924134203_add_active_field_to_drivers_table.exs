defmodule Backend.Repo.Migrations.AddActiveFieldToDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:draft, :boolean)
      add(:active, :boolean, default: false)
    end
  end
end
