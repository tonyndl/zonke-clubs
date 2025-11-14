defmodule Backend.Accounts.BusinessProfile.BusinessProfileBy do
  alias Backend.Accounts.BusinessProfile

  import Ecto.Query

  def base_query() do
    from(bp in BusinessProfile,
      as: :business_profile
    )
  end

  def by_user_id(query, %{user_id: user_id}),
    do: where(query, [business_profile: bp], bp.user_id == ^user_id)

  def by_active(query), do: where(query, [bp], bp.active)
end
