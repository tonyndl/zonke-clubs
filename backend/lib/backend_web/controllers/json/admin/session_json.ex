defmodule BackendWeb.Admin.SessionJSON do
  @moduledoc """
  Renders admin session data (admin + token) in JSON format.
  """

  alias BackendWeb.Admin.AdminJSON

  @doc """
  Renders session data with admin and JWT token.
  """
  def show(%{session: %{admin: admin, jwt: jwt}}) do
    %{
      admin: AdminJSON.show(%{admin: admin}),
      jwt: jwt
    }
  end
end
