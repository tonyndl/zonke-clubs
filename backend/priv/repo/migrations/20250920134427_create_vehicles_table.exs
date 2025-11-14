defmodule Backend.Repo.Migrations.CreateVehiclesTable do
  use Ecto.Migration

  def change do
    create table(:vehicles, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:name, :string)
      add(:make, :string)
      add(:model, :string)
      add(:description, :string)
      add(:mileage, :integer)
      add(:active, :boolean, default: false)
      add(:price_range, :map)
      add(:price_fixed, :map)

      add(:business_profile_id, references(:business_profiles, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end

    create(index(:vehicles, [:business_profile_id]))
  end
end
