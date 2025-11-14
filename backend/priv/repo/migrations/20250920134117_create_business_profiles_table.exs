defmodule Backend.Repo.Migrations.CreateBusinessProfilesTable do
  use Ecto.Migration

  def change do
    create table(:business_profiles, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:name, :string, null: false)
      add(:email, :string)
      add(:phone, :string)
      add(:description, :string)
      add(:location, :map, null: false)
      add(:settings, :map)
      add(:active, :boolean)
      add(:disabled, :boolean, default: false)
      add(:searchable_document, :tsvector)

      add(:user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end

    create(index(:business_profiles, [:searchable_document], using: :gin))
  end
end
