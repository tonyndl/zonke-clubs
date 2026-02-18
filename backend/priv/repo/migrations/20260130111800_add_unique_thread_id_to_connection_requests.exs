defmodule Backend.Repo.Migrations.AddUniqueThreadIdToConnectionRequests do
  use Ecto.Migration

  def change do
    # First, clean up duplicate connection requests with the same thread_id
    # Keep only the most recent non-declined request for each thread
    execute("""
      DELETE FROM connection_requests
      WHERE id NOT IN (
        SELECT DISTINCT ON (thread_id)
        id
        FROM connection_requests
        WHERE thread_id IS NOT NULL
        ORDER BY thread_id, inserted_at DESC
      )
      AND thread_id IS NOT NULL
    """)

    # Add a unique constraint on thread_id (for non-null values)
    # This ensures each thread can only be associated with one connection request
    create unique_index(
             :connection_requests,
             [:thread_id],
             name: :unique_thread_id_on_connection_requests,
             where: "thread_id IS NOT NULL"
           )
  end
end
