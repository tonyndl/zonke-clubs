defmodule BackendWeb.API.UserJSON do
  @moduledoc """
  Renders user data in JSON format.
  """

  @doc """
  Renders a single user.
  """
  def show(%{user: user}) do
    %{
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      vibes: user.vibes,
      favorite_drinks: user.favorite_drinks,
      avatar_url: user.avatar_url,
      location: user.location,
      onboarding_complete: user.onboarding_complete,
      inserted_at: user.inserted_at,
      updated_at: user.updated_at
    }
    |> remove_nil_values()
  end

  @doc """
  Renders password change success message.
  """
  def password_changed(%{message: message}) do
    %{message: message}
  end

  defp remove_nil_values(map) do
    map
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})
  end
end
