defmodule Backend.Repo.Migrations.CreateUsersTable do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :first_name, :string, null: false
      add :last_name, :string, null: false
      add :username, :string, null: false
      add :email, :string
      add :phone, :string
      add :password_hash, :string, null: false
      add :role, :string, null: false

      timestamps()
    end

    create unique_index(:users, [:username])
    create unique_index(:users, [:email])
  end
end
