defmodule Backend.Repo.Migrations.MakeStartTimeNullableInDjSchedules do
  use Ecto.Migration

  def change do
    alter table(:dj_schedules) do
      modify :start_time, :time, null: true, from: {:time, null: false}
    end
  end
end
