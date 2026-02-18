defmodule Backend.Repo.Migrations.AddAdminIdToClubs do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      add :admin_id, references(:admins, type: :binary_id, on_delete: :nilify_all)
    end

    # Make user_id nullable since clubs can be owned by either users or admins
    alter table(:clubs) do
      modify :user_id, :binary_id, null: true
    end

    create index(:clubs, [:admin_id])
  end
end
