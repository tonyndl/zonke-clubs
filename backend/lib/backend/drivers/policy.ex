defmodule Backend.Services.Policy do
  alias Backend.Accounts.Memberships
  @behaviour Bodyguard.Policy

  @admin_roles [:owner, :admin]
  @admins_actions [:create, :update, :delete, :get_services, :show]

  def authorize(action, %{user_id: user_id}, %{user_id: user_id})
      when action in @admins_actions,
      do: :ok

  def authorize(action, %{user_id: user_id})
      when action in @admins_actions do
    authorize_member(user_id)
  end

  def authorize(:show_public, %{draft: false, paused_at: nil}, _), do: :ok

  def authorize(_, _, _), do: :error

  defp authorize_member(user_id) do
    case Memberships.is_member?(user_id) do
      {true, role} when role in @admin_roles -> :ok
      _ -> :error
    end
  end
end
