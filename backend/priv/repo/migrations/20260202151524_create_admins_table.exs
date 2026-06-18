defmodule Backend.Repo.Migrations.CreateAdminsTable do
  use Ecto.Migration

  def change do
    create table(:admins, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :email, :string, null: false
      add :name, :string, null: false
      add :phone, :string
      add :password_hash, :string, null: false
      add :role, :string, null: false, default: "club_admin"
      add :avatar_url, :string
      add :active, :boolean, default: true, null: false

      timestamps()
    end

    create unique_index(:admins, [:email])
  end
end
