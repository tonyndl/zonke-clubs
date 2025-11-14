defmodule Backend.EmptyFieldsHelper do
  def map_has_non_empty_fields?(params) do
    # Find fields that are nil or empty
    nil_or_empty_fields =
      params
      |> Enum.filter(fn {_k, v} -> is_nil(v) or v == "" end)

    # Log if any nil/empty fields exist
    if nil_or_empty_fields != [] do
      IO.puts("Map has nil or empty fields: #{inspect(nil_or_empty_fields)}")
    end

    # Return true if there are any non-nil/non-empty fields
    params
    |> Enum.reject(fn {_k, v} -> is_nil(v) or v == "" end)
    |> Enum.any?()
  end
end
