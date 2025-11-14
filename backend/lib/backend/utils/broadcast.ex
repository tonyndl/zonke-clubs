defmodule Backend.Utils.Broadcast do
  @callback broadcast(String.t(), String.t(), map()) :: :ok | {:error, term()}
  @callback broadcast_from!(pid(), String.t(), String.t(), map()) :: :ok
end
