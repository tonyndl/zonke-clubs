defmodule Backend.Repo.Migrations.CreatePostsTable do
  use Ecto.Migration

  def change do
    create table(:posts, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:description, :string)
      add(:location, :map)
      add(:location_options, {:array, :string})
      add(:licences, {:array, :string})
      add(:searchable_document, :tsvector)

      add(:business_profile_id, references(:business_profiles, type: :uuid, on_delete: :delete_all), null: false)

      timestamps()
    end
  end
end
