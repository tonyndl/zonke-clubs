defmodule Backend.Accounts.BusinessProfiles do
  alias Ecto.Multi
  alias Backend.{Repo, PaginateHelper}
  alias Backend.Accounts.{BusinessProfile, Memberships}
  alias Backend.Accounts.BusinessProfile.{BusinessProfileBy, Policy}
  alias Backend.Assets.Assets

  import Ecto.Query

  defdelegate authorize(action, resource, session), to: Policy

  def create(params, %{user_id: user_id}) do
    business_profile_params =
      params
      |> Map.put(:user_id, user_id)
      |> Map.put(:active, false)

    Multi.new()
    |> Multi.insert(
      :business_profile,
      BusinessProfile.changeset(%BusinessProfile{}, business_profile_params)
    )
    |> Multi.run(:membership, fn _repo, %{business_profile: profile} ->
      Memberships.create(:owner, user_id, profile.id)
    end)
    |> Multi.run(:asset, fn _repo, %{business_profile: business_profile} ->
      asset_params =
        params
        |> Map.get(:asset, %{})
        |> Map.put(:business_profile_id, business_profile.id)

      Assets.upload_and_save(asset_params)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{business_profile: business_profile}} ->
        {:ok, business_profile}

      {:error, step, reason, changes_so_far} ->
        {:error, step, reason}
    end
  end

  def update(%BusinessProfile{} = profile, params) do
    BusinessProfile.changeset(profile, params)
    |> Repo.update()
  end

  def get_business_profile(%{user_id: user_id}) do
    case Repo.get_by(BusinessProfile, user_id: user_id) do
      nil -> {:error, :not_found}
      profile -> {:ok, profile}
    end
  end

  def get_business_profile(id) do
    case Repo.get_by(BusinessProfile, id: id) do
      nil -> {:error, :not_found}
      profile -> {:ok, profile}
    end
  end

  def get_profiles(params, :public) do
    data =
      BusinessProfile
      |> BusinessProfileBy.by_active()
      # |> build_search(params)
      # |> build_sort(params)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  def get_profiles(session) do
    BusinessProfileBy.base_query()
    |> BusinessProfileBy.by_user_id(session)
    |> Repo.all()
  end

  # defp build_search(query, params) do
  #   filters = Map.get(params, :filters, %{})

  #   if Map.has_key?(filters, :search_term) and filters.search_term != "" do
  #     query
  #     |> select_merge([bp], %{
  #       rank_value:
  #         fragment(
  #           "ts_rank(?, websearch_to_tsquery(?)) AS rank_value",
  #           bp.searchable_document,
  #           ^filters.search_term
  #         )
  #     })
  #     |> where(
  #       [bp],
  #       fragment("? @@ websearch_to_tsquery(?)", bp.searchable_document, ^filters.search_term)
  #     )
  #   else
  #     query
  #   end
  # end

  # defp build_sort(query, params) do
  #   order_by_param = Map.get(params, :order_by, %{by: :relevance, direction: :desc})
  #   criteria = Map.get(order_by_param, :by)
  #   direction = Map.get(order_by_param, :direction)

  #   case criteria do
  #     :relevance ->
  #       # Only order by rank_value if it was computed in build_search
  #       if has_search_term?(params) do
  #         order_by(query, [bp], [{^direction, fragment("rank_value")}, {:asc, bp.id}])
  #       else
  #         # Fallback ordering when not searching
  #         order_by(query, [bp], [{:desc, bp.inserted_at}, {:asc, bp.id}])
  #       end

  #     _ ->
  #       query
  #   end
  # end

  # defp has_search_term?(params) do
  #   filters = Map.get(params, :filters, %{})
  #   Map.has_key?(filters, :search_term) and filters.search_term != ""
  # end

  def delete(%BusinessProfile{} = business_profile) do
    # if has_active_bookings(business_profile.id) do
    #   {:ok, :active_booking_exists}
    # else
    #   Repo.delete(business_profile)
    # end

    Repo.delete(business_profile)
  end

  # defp has_active_bookings(profile_id) do
  #   from(b in Booking,
  #     join: s in assoc(b, :service),
  #     where: s.business_profile_id == ^profile_id,
  #     where: b.status == :active
  #   )
  #   |> Repo.aggregate(:count, :id)
  #   |> Kernel.>(0)
  # end
end
