defmodule Backend.Repo.Migrations.AddUniqueConstraintToConnectionRequests do
  use Ecto.Migration

  def change do
    # First, clean up existing duplicate connection requests
    # Keep only the most recent request for each sender-receiver-intention combination
    execute("""
      DELETE FROM connection_requests
      WHERE id NOT IN (
        SELECT DISTINCT ON (sender_id, receiver_id, intention_id)
        id
        FROM connection_requests
        WHERE status != 'declined'
        ORDER BY sender_id, receiver_id, intention_id, inserted_at DESC
      )
      AND status != 'declined'
    """)

    # Create a partial unique index to prevent duplicate connection requests
    # Only applies to non-declined requests (pending or accepted)
    # This prevents:
    # 1. Sending multiple pending requests to the same person for the same intention
    # 2. Sending a request to someone you're already connected with (accepted)
    # But allows sending a new request if the previous one was declined

    create unique_index(
             :connection_requests,
             [:sender_id, :receiver_id, :intention_id],
             name: :unique_active_connection_requests,
             where: "status != 'declined'"
           )
  end
end
