defmodule Backend.PaginateHelper do
  @doc """
  Extracts page and page_size from params, capping page_size at 100.
  """
  def prep_params(params) do
    per_page = Map.get(params, :per_page, Map.get(params, "per_page", 10))
    final_per_page = if is_binary(per_page), do: String.to_integer(per_page), else: per_page

    %{
      page: Map.get(params, :page, Map.get(params, "page", 1)),
      page_size: Kernel.min(final_per_page, 100)
    }
  end

  @doc """
  Serialises a Scrivener page struct into a clean map for JSON responses.
  """
  def prep_paginate(data) do
    %{
      page: data.page_number,
      per_page: data.page_size,
      max_page: data.total_pages,
      total_count: data.total_entries
    }
  end
end
