defmodule Backend.MoxCase do
  use ExUnit.CaseTemplate

  import Mox

  using do
    quote do
      import Mox
    end
  end

  setup :set_mox_from_context
  setup :verify_on_exit!

  setup do
    # ensure all tests run with the mock by default
    Application.put_env(:backend, :broadcast_module, Backend.Utils.BroadcastMock)
    :ok
  end
end
