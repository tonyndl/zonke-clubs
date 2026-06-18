defmodule BackendWeb.Admin.AdminJSON do
  @moduledoc """
  Renders admin data in JSON format.
  """

  @doc """
  Renders a single admin.
  """
  def show(%{admin: admin}) do
    %{
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      avatar_url: admin.avatar_url,
      active: admin.active,
      inserted_at: admin.inserted_at,
      updated_at: admin.updated_at
    }
    |> remove_nil_values()
  end

  @doc """
  Renders admin with JWT token (for registration response).
  """
  def show_with_token(%{admin: admin, jwt: jwt}) do
    %{
      admin: show(%{admin: admin}),
      jwt: jwt
    }
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
