defmodule Backend.Repo.Migrations.ModifyUsernameFieldToNullTrueInUsersTable do
  use Ecto.Migration

  def change do
    alter table(:users) do
      modify(:username, :string, null: true)
    end
  end
end
