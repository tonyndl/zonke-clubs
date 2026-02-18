defmodule Backend.Repo.Migrations.CreateSpendingRecordsTable do
  use Ecto.Migration

  def change do
    create table(:spending_records, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :amount, :decimal, precision: 10, scale: 2, null: false
      add :visit_date, :date, null: false
      add :notes, :text

      # Group spending / bill splitting fields
      add :group_outing_id, :binary_id
      add :paid_by_user_id, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :split_type, :string
      add :original_amount, :decimal, precision: 10, scale: 2
      add :participant_ids, {:array, :binary_id}, default: []

      timestamps()
    end

    create index(:spending_records, [:club_id])
    create index(:spending_records, [:user_id])
    create index(:spending_records, [:visit_date])
    create index(:spending_records, [:group_outing_id])
    create index(:spending_records, [:amount])
  end
end
