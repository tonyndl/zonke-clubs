defmodule Backend.Accounts.Memberships do
  alias Backend.Repo
  alias Backend.Accounts.Membership

  def create(role, user_id)
      when is_binary(user_id) do
    params = %{
      user_id: user_id,
      role: role
    }

    %Membership{}
    |> Membership.changeset(params)
    |> Repo.insert()
  end

  def create(_role, _user_id), do: :error

  # consider catching memberships on redis
  def is_member?(user_id)
      when is_binary(user_id) do
    Membership
    |> Repo.get_by(user_id: user_id)
    |> case do
      %Membership{role: role} -> {true, role}
      _ -> false
    end
  end

  def is_member(_, _), do: false
end
