defmodule BackendWeb.API.SessionJSON do
  @moduledoc """
  Renders session data (user + token) in JSON format.
  """

  alias BackendWeb.API.UserJSON

  @doc """
  Renders session data with user and JWT token.
  """
  def show(%{session: %{user: user, jwt: jwt}}) do
    %{
      user: UserJSON.show(%{user: user}),
      jwt: jwt
    }
  end
end
