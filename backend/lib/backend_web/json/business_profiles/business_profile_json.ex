defmodule BackendWeb.BusinessProfiles.BusinessProfilesJSON do
  alias BackendWeb.Services.ServiceJSON

  def index(%{business_profiles: profiles, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(profile <- profiles, do: show(%{business_profile: profile}))
    }
  end

  def index(%{data: profiles}) do
    for(profile <- profiles, do: show(%{business_profile: profile}))
  end

  def show(%{business_profile: business_profile}) do
    services =
      case Map.get(business_profile, :services) do
        %Ecto.Association.NotLoaded{} -> []
        nil -> []
        services -> ServiceJSON.index(%{services: services})
      end

    %{
      id: business_profile.id,
      name: business_profile.name,
      description: business_profile.description,
      location: business_profile.location,
      tags: business_profile.tags,
      email: business_profile.email,
      phone: business_profile.phone,
      active: business_profile.active,
      rank_value: business_profile.rank_value,
      inserted_at: business_profile.inserted_at,
      updated_at: business_profile.updated_at,
      services: services
    }
  end
end
