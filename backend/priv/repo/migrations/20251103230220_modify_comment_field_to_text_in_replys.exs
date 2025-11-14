defmodule Backend.Repo.Migrations.ModifyCommentFieldToTextInReplys do
  use Ecto.Migration

  def change do
    alter table(:replys) do
      remove(:comment)
      add(:text, :text)
    end
  end
end
