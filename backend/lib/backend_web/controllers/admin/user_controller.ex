defmodule BackendWeb.Admin.UserController do
  use BackendWeb, :controller
  action_fallback BackendWeb.FallbackController

  alias Backend.Accounts.Users

  @doc """
  Searches for club goers by username or name.
  Query params:
  - q: search query string
  - exclude_ids: comma-separated list of user IDs to exclude (optional)
  - limit: max number of results (optional, default 10)
  """
  def search(conn, params, _session) do
    query = Map.get(params, "q", "")
    exclude_ids_str = Map.get(params, "exclude_ids", "")
    limit = Map.get(params, "limit", "10")

    exclude_ids =
      if exclude_ids_str == "" do
        []
      else
        String.split(exclude_ids_str, ",")
        |> Enum.map(&String.trim/1)
        |> Enum.reject(&(&1 == ""))
      end

    opts = [
      exclude_ids: exclude_ids,
      limit: String.to_integer(limit)
    ]

    users = Users.search_users(query, opts)

    conn
    |> put_status(:ok)
    |> render(:index, users: users)
  end
end
