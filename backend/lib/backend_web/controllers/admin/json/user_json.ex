defmodule BackendWeb.Admin.UserJSON do
  @moduledoc """
  JSON views for admin user operations.
  """

  def index(%{users: users}) do
    %{users: Enum.map(users, &data/1)}
  end

  defp data(user) do
    %{
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end
end
