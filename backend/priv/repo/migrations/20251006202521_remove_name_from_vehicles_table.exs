defmodule Backend.Repo.Migrations.RemoveNameFromVehiclesTable do
  use Ecto.Migration

  def change do
    alter table(:vehicles) do
      remove(:name, :string)
      remove(:make, :string)
    end
  end
end
