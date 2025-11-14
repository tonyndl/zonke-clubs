defmodule BackendWeb.Drivers.DriverJSON do
  alias BackendWeb.UserJSON
  alias Backend.Assets.Assets

  def index(%{drivers: drivers, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(driver <- drivers, do: show(%{driver: driver}))
    }
  end

  def index(%{drivers: drivers}) do
    for(driver <- drivers, do: show(%{driver: driver}))
  end

  def show(%{driver: driver}) do
    user_map = Map.get(driver, :user)
    user =
      if Ecto.assoc_loaded?(user_map) and not is_nil(user_map) do
        UserJSON.show(%{user: user_map})
      else
        nil
      end

    asset_url =
      if Map.has_key?(driver, :asset_filename), do: Assets.prepare_url(driver.asset_filename), else: nil

    %{
      id: Map.get(driver, :id),
      description: Map.get(driver, :description),
      paused_at: Map.get(driver, :paused_at),
      dob: Map.get(driver, :dob),
      experience: Map.get(driver, :experience),
      location: Map.get(driver, :location),
      licences: Map.get(driver, :licences),
      booking_count: Map.get(driver, :booking_count),
      platforms: Map.get(driver, :platforms),
      first_name: Map.get(driver, :first_name),
      last_name: Map.get(driver, :last_name),
      username: Map.get(driver, :username),
      user_id: Map.get(driver, :user_id),
      total_accidents: Map.get(driver, :total_accidents),
      previous_vehicles: Map.get(driver, :previous_vehicles),
      rating: Map.get(driver, :rating),
      inserted_at: Map.get(driver, :inserted_at),
      updated_at: Map.get(driver, :updated_at),
      asset_url: asset_url,
      user: user
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})
  end
end
