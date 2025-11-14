defmodule Backend.Applications.Queries.VehicleApplicationBy do
  alias Backend.Applications.VehicleApplication
  import Ecto.Query

  def base_query do
    from(va in VehicleApplication,
      as: :vehicle_applications
    )
  end

  def by_id(query, id) do
    where(query, [vehicle_applications: va], va.id == ^id)
  end

  def by_vehicle(query, vehicle_id) do
    where(query, [vehicle_applications: va], va.vehicle_id == ^vehicle_id)
  end

  def by_driver(query, driver_id) do
    query
    |> where([vehicle_applications: va], va.driver_id == ^driver_id)
  end

  def by_vehicle_owner(query, id) do
    query
    |> join(:inner, [vehicle_applications: va], v in assoc(va, :vehicle), as: :vehicle)
    |> where([vehicle: v], v.user_id == ^id)
  end

  # def by_accepted_status(query, user_id) do
  #   query
  #   |> where([vehicle_applications: va],va.status == :accepted)
  #   |> order_by([vehicle_applications: va], desc: va.inserted_at)
  # end

  # def by_pending_status(query, profile_id) do
  #   query
  #   |> where([vehicle_applications: va],va.status == :pending)
  #   |> order_by([vehicle_applications: va], desc: va.inserted_at)
  # end

  # def by_rejected_status(query, profile_id) do
  #   query
  #   |> where([vehicle_applications: va],va.status == :rejected)
  #   |> order_by([vehicle_applications: va], desc: va.inserted_at)
  # end
end
