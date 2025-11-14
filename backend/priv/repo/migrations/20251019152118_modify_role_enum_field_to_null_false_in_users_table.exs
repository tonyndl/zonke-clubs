defmodule Backend.Repo.Migrations.ModifyRoleEnumFieldToNullFalseInUsersTable do
  use Ecto.Migration

  def change do
    alter table(:users) do
      modify(:role, :role_enum, null: false)
    end
  end
end
