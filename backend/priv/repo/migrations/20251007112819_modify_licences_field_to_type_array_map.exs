defmodule Backend.Repo.Migrations.ModifyLicencesFieldToTypeArrayMap do
  use Ecto.Migration

  def change do
    alter table(:drivers) do
      remove(:licences, :map)
      add(:licences, {:array, :map})
    end
  end
end
