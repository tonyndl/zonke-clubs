defmodule Backend.Repo.Migrations.AddReplyToCommentsDeleteFromReview do
  use Ecto.Migration

  def change do
    drop index(:reviews, [:vehicle_id])

    alter table(:reviews) do
      remove(:comment)
      remove(:likes)
      remove(:users_liked)

      remove(:vehicle_id)
    end

    alter table(:replys) do
      remove(:review_id)
      add(:comment_id, references(:comments, type: :uuid), null: false)
    end
  end
end
