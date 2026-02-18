defmodule Backend.Repo.Migrations.AddProfileFieldsToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :bio, :text
      add :vibes, {:array, :string}, default: []
      add :favorite_drinks, {:array, :string}, default: []
      add :onboarding_complete, :boolean, default: false
    end
  end
end
