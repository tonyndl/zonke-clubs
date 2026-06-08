defmodule Backend.Repo.Migrations.AddBannerPositionToClubs do
  use Ecto.Migration
  def change do
    alter table(:clubs) do
      add :banner_position_x, :float, default: 50.0
      add :banner_position_y, :float, default: 50.0
    end
  end
end
