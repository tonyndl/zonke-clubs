defmodule Backend.Repo.Migrations.CreateEventsTable do
  use Ecto.Migration

  def change do
    create table(:events, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :text, null: false
      add :date, :date, null: false
      add :start_time, :string, null: false
      add :end_time, :string, null: false
      add :general_entry_price, :decimal, precision: 10, scale: 2, null: false
      add :vip_entry_price, :decimal, precision: 10, scale: 2, null: false
      add :dj_lineup, {:array, :string}, default: []
      add :cover_image, :string
      add :status, :string, null: false, default: "draft"
      add :admin_id, references(:admins, type: :binary_id, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:events, [:admin_id])
    create index(:events, [:date])
    create index(:events, [:status])
  end
end
