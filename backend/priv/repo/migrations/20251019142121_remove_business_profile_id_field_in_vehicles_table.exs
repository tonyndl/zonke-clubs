defmodule Backend.Repo.Migrations.RemoveBusinessProfileIdFieldInVehiclesTable do
  use Ecto.Migration

  def change do
    alter table(:vehicles) do
      remove(:business_profile_id)
    end

    alter table(:drivers) do
      remove(:business_profile_id)
    end

    alter table(:assets) do
      remove(:business_profile_id)
      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: true)
    end

    drop(index(:memberships, [:business_profile_id, :user_id]))

    alter table(:memberships) do
      remove(:business_profile_id)
    end

    alter table(:posts) do
      remove(:business_profile_id)
    end
  end
end
