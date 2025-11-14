# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :backend,
  ecto_repos: [Backend.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :backend, BackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Backend.PubSub,
  live_view: [signing_salt: "yg5RdB7r"]

# config :paginator, Paginator,
#   cursor_serializer: Paginator.Cursors.JSON

config :ex_aws,
  access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
  # or your region
  region: "us-east-1"

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :backend, Backend.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"

config :backend, Backend.Guardian,
  issuer: "Backend",
  # TODO -> gen a secret key and store in aws param store
  secret_key: "aT8AZ2VYDaC8tgQXgWR69GbHSZYXIe9+0pqJQYKE5JOQJGa/RXvHh7M0VuBQ1jhJ"

config :backend, Backend.Repo,
  migration_primary_key: [type: :uuid],
  migration_foreign_key: [type: :uuid]

config :backend, :broadcast_module, Backend.Utils.BroadcastImpl
