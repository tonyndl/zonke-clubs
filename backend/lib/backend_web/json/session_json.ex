defmodule BackendWeb.SessionJSON do
  alias BackendWeb.UserJSON

  def show(%{session: session}) do
    %{
      user: UserJSON.show(%{user: session.user}),
      jwt: session.jwt
    }
  end
end
