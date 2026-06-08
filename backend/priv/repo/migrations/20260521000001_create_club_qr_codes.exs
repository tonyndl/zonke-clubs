defmodule Backend.Repo.Migrations.CreateClubQrCodes do
  use Ecto.Migration

  def change do
    create table(:club_qr_codes, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :token, :string, null: false
      add :club_id, references(:clubs, type: :binary_id, on_delete: :delete_all), null: false
      add :label, :string
      add :valid_date, :date, null: false
      add :expires_at, :utc_datetime, null: false

      timestamps()
    end

    create unique_index(:club_qr_codes, [:token])
    create index(:club_qr_codes, [:club_id])
  end
end
