defmodule BackendWeb.API.ClubJSON do
  @moduledoc """
  JSON views for Club resources.
  """

  def index(%{clubs: clubs}) do
    %{clubs: Enum.map(clubs, &data/1)}
  end

  def show(%{club: club}) do
    %{club: data(club)}
  end

  def like_success(%{message: message}) do
    %{message: message}
  end

  def unlike_success(%{message: message}) do
    %{message: message}
  end

  defp data(club) do
    base_data = %{
      id: club.id,
      name: club.name,
      description: club.description,
      location: club.location,
      email: club.email,
      phone: club.phone,
      active: club.active,
      vibes: club.vibes,
      music_genres: club.music_genres,
      dress_code: club.dress_code,
      entry_fee: club.entry_fee,
      opening_hours: club.opening_hours || %{},
      inserted_at: club.inserted_at,
      updated_at: club.updated_at
    }

    # Include is_liked if it's present (virtual field)
    if Map.has_key?(club, :is_liked) do
      Map.put(base_data, :is_liked, club.is_liked)
    else
      base_data
    end
  end
end
