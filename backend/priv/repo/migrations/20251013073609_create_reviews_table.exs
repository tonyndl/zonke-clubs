defmodule Backend.Repo.Migrations.CreateReviewsTable do
  use Ecto.Migration

  def change do
    create table(:reviews, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:comment, :text)
      add(:likes, :integer, default: 0)
      add(:users_liked, {:array, :string}, default: [])
      add(:rating, :float, null: false)

      add(:author_id, references(:users, type: :uuid), null: false)
      add(:vehicle_id, references(:vehicles, type: :uuid, on_delete: :delete_all))
      add(:driver_id, references(:drivers, type: :uuid, on_delete: :delete_all))

      timestamps()
    end

    create index(:reviews, [:vehicle_id])
    create index(:reviews, [:driver_id])
    create index(:reviews, [:author_id])
  end
end
