defmodule Backend.AtomKeysHelper do
  def string_keys_to_atoms(map) do
    for {k, v} <- map, into: %{} do
      {String.to_existing_atom(k), v}
    end
  end
end
