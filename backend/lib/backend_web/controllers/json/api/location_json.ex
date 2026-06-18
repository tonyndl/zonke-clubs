defmodule BackendWeb.API.LocationJSON do
  def ok(_), do: %{ok: true}

  def search(%{locations: locations}) do
    %{locations: locations}
  end
end
