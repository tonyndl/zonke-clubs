defmodule Backend.Repo.Migrations.CreateDjSchedulesTable do
  use Ecto.Migration

  def change do
    create table(:dj_schedules, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :dj_id, references(:djs, on_delete: :delete_all, type: :binary_id), null: false
      add :day_of_week, :integer
      add :start_time, :time, null: false
      add :end_time, :time
      add :notes, :text
      add :type, :string, null: false
      add :specific_date, :date
      add :club_id, references(:clubs, on_delete: :delete_all, type: :binary_id), null: false

      timestamps()
    end

    create index(:dj_schedules, [:dj_id])
    create index(:dj_schedules, [:club_id])
    create index(:dj_schedules, [:day_of_week])
  end
end
