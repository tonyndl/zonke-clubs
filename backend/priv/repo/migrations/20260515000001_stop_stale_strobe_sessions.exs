defmodule Backend.Repo.Migrations.StopStrobeStaleStrobeSessions do
  use Ecto.Migration

  def up do
    execute """
    UPDATE strobe_sessions
    SET status = 'stopped', updated_at = NOW()
    WHERE status = 'active'
      AND started_at < NOW() - INTERVAL '6 hours'
    """
  end

  def down, do: :ok
end
