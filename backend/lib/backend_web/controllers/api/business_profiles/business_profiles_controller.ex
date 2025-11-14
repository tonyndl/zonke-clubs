defmodule BackendWeb.BusinessProfiles.BusinessProfilesController do
  use BackendWeb, :controller
  use BackendWeb.AuthenticatedController

  alias Backend.Accounts.BusinessProfiles

  # TODO: add rate limiting

  def index(conn, _, session) do
    with profiles <- BusinessProfiles.get_profiles(session) do
      render(conn, :index, profiles: profiles)
    end
  end

  def public_index(conn, params, _session) do
    with {:ok, business_profiles, paginate} <- BusinessProfiles.get_profiles(params, :public) do
      render(conn, :index, %{business_profiles: business_profiles, paginate: paginate})
    end
  end

  def create(conn, params, session) do
    # TODO: max of 5 profiles
    with {:ok, %{business_profile: profile}} <- BusinessProfiles.create(params, session) do
      render(conn, :show, business_profile: profile)
    end
  end

  def show(conn, %{id: id}, session) do
    with {:ok, profile} <- BusinessProfiles.get_business_profile(id),
         :ok <- Bodyguard.permit(BusinessProfiles, :show, profile, session) do
      render(conn, :show, business_profile: profile)
    end
  end

  def show_public(conn, %{id: id}, session) do
    with {:ok, profile} <- BusinessProfiles.get_business_profile(id),
         :ok <- Bodyguard.permit(BusinessProfiles, :show_public, profile, session) do
      render(conn, :show, business_profile: profile)
    end
  end
end
