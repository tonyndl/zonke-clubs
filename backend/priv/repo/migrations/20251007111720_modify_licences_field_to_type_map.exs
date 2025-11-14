defmodule Backend.Repo.Migrations.ModifyLicencesFieldToTypeMap do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:licences, {:array, :string})
      add(:licences, :map)
    end
  end
end
