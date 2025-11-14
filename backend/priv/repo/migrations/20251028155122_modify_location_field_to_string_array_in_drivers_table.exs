defmodule Backend.Repo.Migrations.ModifyLocationFieldToStringArrayInDriversTable do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:licences, :map)
      add(:licences, {:array, :string})
    end
  end
end
