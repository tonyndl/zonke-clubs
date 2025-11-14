defmodule Backend.Repo.Migrations.AddModelYearFieldToVehiclesTable do
  use Ecto.Migration

  def change do
    alter table(:vehicles) do
      add(:model_year, :integer)
    end
  end
end
