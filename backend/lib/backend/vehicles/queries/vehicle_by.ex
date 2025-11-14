defmodule Backend.Vehicles.Queries.VehicleBy do
  alias Backend.Vehicles.Vehicle
  import Ecto.Query

  def base_query do
    from(v in Vehicle,
      as: :vehicle
    )
  end

  def by_id(query, id) do
    where(query, [vehicle: v], v.id == ^id)
  end

  def by_user(query, id) do
    where(query, [vehicle: v], v.user_id == ^id)
  end

  def by_active_status(query) do
    where(
      query,
      [vehicle: v],
      v.active == true
    )
  end
end
