defmodule Backend.Repo.Migrations.AssDobFieldToUsersTable do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:active, :boolean)
    end
  end
end
