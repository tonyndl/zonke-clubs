defmodule Backend.Guardian.AuthAccessPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :backend,
    module: Backend.Guardian,
    error_handler: Backend.Guardian.AuthErrorHandler

  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.EnsureAuthenticated)
  plug(Guardian.Plug.LoadResource)
end
