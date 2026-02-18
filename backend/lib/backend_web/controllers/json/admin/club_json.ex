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
      vibes: club.vibes,
      music_genres: club.music_genres,
      dress_code: club.dress_code,
      entry_fee: club.entry_fee,
      opening_hours: club.opening_hours || %{},
      admin_id: club.admin_id,
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
