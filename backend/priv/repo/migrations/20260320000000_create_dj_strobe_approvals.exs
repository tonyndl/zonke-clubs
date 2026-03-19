defmodule Backend.Repo.Migrations.CreateDjStrobeApprovals do
  use Ecto.Migration

  def change do
    create table(:dj_strobe_approvals, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :dj_user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      # approved_by is null while status is pending (request not yet approved)
      add :approved_by, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :status, :string, null: false, default: "pending"
      add :expires_at, :utc_datetime

      timestamps()
    end

    create index(:dj_strobe_approvals, [:dj_user_id])
    create index(:dj_strobe_approvals, [:club_id])
    create index(:dj_strobe_approvals, [:status])
    create unique_index(:dj_strobe_approvals, [:dj_user_id, :club_id],
      name: :unique_active_dj_strobe_approval
    )
  end
end
