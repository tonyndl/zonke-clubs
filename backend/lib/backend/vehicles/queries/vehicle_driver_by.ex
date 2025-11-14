defmodule Backend.Vehicles.Queries.VehicleDriverBy do
  alias Backend.Vehicles.VehicleDriver
  alias Backend.Drivers.Driver

  import Ecto.Query

  def base_query do
    from(vd in VehicleDriver,
      as: :vehicle_driver
    )
  end

  def by_id(query, id) do
    where(query, [vehicle_driver: vd], vd.id == ^id)
  end

  def by_id_with_preloads(id) do
    driver_query =
      from(d in Driver,
        join: u in assoc(d, :user),
        left_join: a in assoc(u, :asset),
        select: %{
          id: d.id,
          first_name: u.first_name,
          last_name: u.last_name,
          asset_filename: a.filename
        }
      )

    base_query()
    |> by_id(id)
    |> preload(driver: ^driver_query)
  end

  def by_vehicle_owner(query, id) do
    query
    |> join(:inner, [vehicle_driver: vd], v in assoc(vd, :vehicle), as: :vehicle)
    |> join(:inner, [vehicle_driver: vd], d in assoc(vd, :driver), as: :driver)
    |> where([vehicle: v], v.user_id == ^id)
  end

  def by_driver(query, id) do
    query
    |> join(:inner, [vehicle_driver: vd], d in assoc(vd, :driver), as: :driver)
    |> join(:inner, [vehicle_driver: vd], v in assoc(vd, :vehicle), as: :vehicle)
    |> where([driver: d], d.user_id == ^id)
  end
end
