defmodule Backend.Repo.Migrations.AddAssetTable do
  use Ecto.Migration

  def change do
    create table(:assets, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:copied, :boolean)
      add(:meta, :map)
      add(:url, :string)

      add(:vehicle_id, references(:vehicles, type: :uuid, on_delete: :delete_all), null: false)
      add(:business_profile_id, references(:business_profiles, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end
  end
end
