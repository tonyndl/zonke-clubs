defmodule Backend.Repo.Migrations.AddStatusToDjStrobeApprovals do
  use Ecto.Migration

  def change do
    alter table(:dj_strobe_approvals) do
      add :status, :string, null: false, default: "pending"
      modify :approved_by, references(:users, type: :binary_id, on_delete: :nilify_all),
        null: true,
        from: references(:users, type: :binary_id, on_delete: :nilify_all)
      modify :expires_at, :utc_datetime, null: true, from: :utc_datetime
    end
  end
end
