defmodule BackendWeb.API.PushTokenJSON do
  def ok(_) do
    %{ok: true}
  end

  def index(%{tokens: tokens}) do
    %{tokens: tokens}
  end
end
