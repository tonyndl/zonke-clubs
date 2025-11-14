defmodule Backend.Repo.Migrations.ModifyVehicleIdAndBusinessProfileIdInAssetsTable do
  use Ecto.Migration

  def change do
    alter table(:assets) do
      modify(:vehicle_id, :uuid, null: true)
      modify(:business_profile_id, :uuid, null: true)
    end
  end
end
