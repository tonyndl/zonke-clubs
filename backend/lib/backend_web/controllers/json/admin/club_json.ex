defmodule BackendWeb.Admin.ClubJSON do
  @moduledoc """
  Renders club data in JSON format for admin endpoints.
  """

  @doc """
  Renders a single club.
  """
  def show(%{club: club}) do
    %{
      id: club.id,
      name: club.name,
      email: club.email,
      phone: club.phone,
      description: club.description,
      location: club.location,
      active: club.active,
      dress_code: club.dress_code,
      entry_fee: club.entry_fee,
      opening_hours: club.opening_hours || %{},
      next_week_hours: club.next_week_hours || %{},
      table_reservation_numbers: club.table_reservation_numbers || [],
      banner_position_x: club.banner_position_x,
      banner_position_y: club.banner_position_y,
      admin_id: club.admin_id,
      banner_image_url: Map.get(club, :banner_image_url),
      inserted_at: club.inserted_at,
      updated_at: club.updated_at
    }
    |> remove_nil_values()
  end

  defp remove_nil_values(map) do
    map
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})
  end
end
