defmodule Backend.Repo.Migrations.AddDobFieldToDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      add(:dob, :string)
      remove(:age, :integer)
    end
  end
end
