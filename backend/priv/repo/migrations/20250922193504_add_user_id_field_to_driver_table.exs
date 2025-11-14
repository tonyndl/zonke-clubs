defmodule Backend.Repo.Migrations.AddUserIdFieldToDriverTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)
    end

    create(index(:drivers, [:user_id]))
  end
end
