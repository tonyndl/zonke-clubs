defmodule Backend.Repo.Migrations.AddRoleEnumInUsersTable do
  use Ecto.Migration

  def up do
    execute(
      "CREATE TYPE role_enum AS ENUM ('driver', 'owner', 'member')"
    )

    alter table(:users) do
      add(:role, :role_enum)
    end
  end

  def down do
    execute("DROP TYPE role_enum")
  end
end
