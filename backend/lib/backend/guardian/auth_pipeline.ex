defmodule Backend.Guardian.AuthPipeline do
  @moduledoc """
  Pipeline for authenticated routes.
  Verifies JWT token and loads user resource.
  """
  use Guardian.Plug.Pipeline,
    otp_app: :backend,
    module: Backend.Guardian,
    error_handler: Backend.Guardian.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
  plug Backend.Guardian.CurrentUser
end
