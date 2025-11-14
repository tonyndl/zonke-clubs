defmodule Backend.Repo.Migrations.AddUsersNameTrgmIdxInUsersTable do
  use Ecto.Migration

  def change do
    execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    execute("CREATE INDEX users_first_name_trgm_idx ON users USING gin (first_name gin_trgm_ops);")
    execute("CREATE INDEX users_last_name_trgm_idx ON users USING gin (last_name gin_trgm_ops);")
  end
end
