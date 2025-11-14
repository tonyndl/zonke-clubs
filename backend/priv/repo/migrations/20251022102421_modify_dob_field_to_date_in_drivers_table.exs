defmodule Backend.Repo.Migrations.ModifyDobFieldToDateInDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:dob, :string)
      add(:dob, :date)
    end
  end
end
