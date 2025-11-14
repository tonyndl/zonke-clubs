defmodule Backend.Repo.Migrations.CreateDriversTable do
  use Ecto.Migration

  def change do
    create table(:drivers, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:description, :string)
      add(:location, :map)
      add(:location_options, {:array, :string})
      add(:licences, {:array, :string})
      add(:draft, :boolean)
      add(:paused_at, :naive_datetime)
      add(:experience, :string)
      add(:age, :integer)
      add(:searchable_document, :tsvector)
      add(:price_range, :map)
      add(:price_fixed, :map)

      add(:business_profile_id, references(:business_profiles, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end

    create(index(:drivers, [:business_profile_id]))
    create(index(:drivers, [:searchable_document], using: :gin))
  end
end
