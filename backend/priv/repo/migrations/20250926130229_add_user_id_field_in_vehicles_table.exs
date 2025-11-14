defmodule Backend.Repo.Migrations.AddUserIdFieldInVehiclesTable do
  use Ecto.Migration

  def change do
    alter table(:vehicles) do
      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)
    end
  end
end
