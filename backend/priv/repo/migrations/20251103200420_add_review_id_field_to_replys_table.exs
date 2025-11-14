defmodule Backend.Repo.Migrations.AddReviewIdFieldToReplysTable do
  use Ecto.Migration

  def change do
    alter table(:replys) do
      remove(:driver_id, references(:drivers, type: :uuid, on_delete: :delete_all))
      add(:review_id, references(:reviews, type: :uuid), null: false)
    end
  end
end
