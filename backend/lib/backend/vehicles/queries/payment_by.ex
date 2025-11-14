defmodule Backend.Vehicles.Queries.PaymentBy do
  alias Backend.Vehicles.Payment
  import Ecto.Query

  def base_query do
    from(p in Payment,
      as: :payment
    )
  end

  def by_id(query, id) do
    where(query, [payment: p], p.id == ^id)
  end

  def by_vehicle_driver(query, id) do
    query
    |> where([payment: p], p.vehicle_driver_id == ^id)
  end
end
