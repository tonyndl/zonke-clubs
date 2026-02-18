defmodule Backend.Repo.Migrations.CreateAssetsTable do
  use Ecto.Migration

  def change do
    create table(:assets, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :filename, :string, null: false
      add :copied, :boolean, default: false
      add :meta, :map, default: %{}
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all)
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all)

      timestamps()
    end

    create index(:assets, [:user_id])
    create index(:assets, [:club_id])
  end
end
