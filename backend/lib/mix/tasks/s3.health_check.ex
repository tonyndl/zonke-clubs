defmodule Mix.Tasks.S3.HealthCheck do
  @moduledoc """
  Performs a health check on S3 and optionally cleans up orphaned assets.

  Usage:
    mix s3.health_check              # Check only
    mix s3.health_check --cleanup    # Check and clean up orphaned records
  """
  use Mix.Task
  alias Backend.Assets
  alias Backend.Assets.Cleanup

  @shortdoc "Performs S3 health check"

  def run(args) do
    Mix.Task.run("app.start")

    IO.puts("\n🏥 S3 Health Check\n")

    # Check if LocalStack is accessible
    case check_s3_connection() do
      :ok ->
        IO.puts("✅ S3 connection successful")
        check_bucket()

        if "--cleanup" in args do
          IO.puts("\n🧹 Running cleanup...")
          Cleanup.cleanup_all()
        else
          IO.puts("\n💡 Tip: Run 'mix s3.health_check --cleanup' to remove orphaned records")
        end

      {:error, reason} ->
        IO.puts("❌ S3 connection failed: #{inspect(reason)}")
        IO.puts("\n📝 Make sure LocalStack is running:")
        IO.puts("   cd docker && docker-compose up -d")
        exit({:shutdown, 1})
    end

    IO.puts("\n✅ Health check complete\n")
  end

  defp check_s3_connection do
    bucket = "zonke-clubs-bucket"
    config = Assets.s3_config()

    case ExAws.S3.head_bucket(bucket) |> ExAws.request(config: config) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  defp check_bucket do
    # Count objects in bucket
    bucket = "zonke-clubs-bucket"
    config = Assets.s3_config()

    case ExAws.S3.list_objects(bucket) |> ExAws.request(config: config) do
      {:ok, %{body: body}} ->
        contents = body[:contents] || []
        file_count = length(contents)
        IO.puts("📁 S3 bucket has #{file_count} file(s)")

        if file_count == 0 do
          IO.puts("⚠️  Bucket is empty - users may need to re-upload content")
        end

      {:error, reason} ->
        IO.puts("⚠️  Could not list bucket contents: #{inspect(reason)}")
    end
  end
end
