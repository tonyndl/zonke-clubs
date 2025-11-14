defmodule Backend.Repo do
  use Ecto.Repo,
    otp_app: :backend,
    adapter: Ecto.Adapters.Postgres

  use Scrivener

  # def init(_type, config) do
  #   if System.get_env("MIX_ENV") === "test" do
  #     :ok = Application.ensure_started(:dotenv)
  #   end

  #   {:ok, Confex.Resolver.resolve!(config)}
  # end

  def cursor_paginate(queryable, opts \\ [], repo_opts \\ []) do
    # Changed limit to 10 for production
    defaults = [limit: 10, include_total_count: true, cursor_serializer: Paginator.Cursors.JSON]
    opts = Keyword.merge(defaults, opts)

    Paginator.paginate(queryable, opts, __MODULE__, repo_opts)
  end
end
