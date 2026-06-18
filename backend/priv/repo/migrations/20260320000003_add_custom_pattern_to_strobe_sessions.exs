defmodule Backend.Repo.Migrations.AddCustomPatternToStrobeSessions do
  use Ecto.Migration

  def change do
    alter table(:strobe_sessions) do
      add :custom_on_ms, :integer
      add :custom_off_ms, :integer
    end
  end
end
