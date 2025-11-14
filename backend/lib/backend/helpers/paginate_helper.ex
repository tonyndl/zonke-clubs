defmodule Backend.PaginateHelper do
  @moduledoc """
  Helper module for preparing pagination params.
  """

  @doc """
  Prepare parameters map for scrivener_ecto library in form of atom keys and values.

  """
  def prep_params(params) do
    per_page = Map.get(params, :per_page, Map.get(params, "per_page", 7))
    final_per_page = if is_binary(per_page), do: String.to_integer(per_page), else: per_page

    %{
      page: Map.get(params, :page, Map.get(params, "page", 1)),
      page_size: Kernel.min(final_per_page, 100)
    }

    # |> params_to_i()
  end

  @doc """
  Prepare paginate map from scrivener_ecto library.

  """
  def prep_paginate(data) do
    %{
      page: data.page_number,
      per_page: data.page_size,
      max_page: data.total_pages,
      total_count: data.total_entries
    }
  end

  defp params_to_i(params) do
    Enum.into(Enum.map(params, fn {k, v} -> {k, to_integer(v)} end), %{})
  end

  defp to_integer(i) when is_integer(i), do: i
  defp to_integer(i) when is_binary(i), do: String.to_integer(i)
end
