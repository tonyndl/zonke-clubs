defmodule Backend.Repo.Migrations.AddTableReservationNumbersToClubs do
  use Ecto.Migration

  def change do
    alter table(:clubs) do
      add :table_reservation_numbers, {:array, :string}, default: []
    end
  end
end
