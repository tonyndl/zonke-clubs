defmodule Mix.Tasks.Assets.Cleanup do
  @moduledoc """
  Cleans up orphaned asset records where S3 files don't exist.

  Usage:
    mix assets.cleanup              # Clean up all orphaned assets and avatars
    mix assets.cleanup --assets     # Only clean up asset records
    mix assets.cleanup --avatars    # Only clean up user avatars
  """
  use Mix.Task
  alias Backend.Assets.Cleanup

  @shortdoc "Cleans up orphaned assets"

  def run(args) do
    Mix.Task.run("app.start")

    case args do
      ["--assets"] ->
        Cleanup.remove_orphaned_assets()

      ["--avatars"] ->
        Cleanup.cleanup_user_avatars()

      _ ->
        Cleanup.cleanup_all()
    end
  end
end
