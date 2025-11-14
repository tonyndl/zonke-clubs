defmodule Backend.Repo.Migrations.CreateMembershipsTable do
  use Ecto.Migration

  def change do
    create table(:memberships, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:role, :integer, null: false)
      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)

      add(
        :business_profile_id,
        references(:business_profiles, type: :uuid, on_delete: :delete_all),
        null: false
      )

      timestamps()
    end

    create(index(:memberships, [:user_id]))
    create(index(:memberships, [:business_profile_id, :user_id]))
  end
end
