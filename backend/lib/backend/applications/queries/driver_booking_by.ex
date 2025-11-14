defmodule Backend.Applications.Queries.DriverBookingBy do
  alias Backend.Applications.DriverBooking
  import Ecto.Query

  def base_query do
    from(db in DriverBooking,
      as: :driver_booking
    )
  end

  def by_id(query, id) do
    where(query, [driver_booking: db], db.id == ^id)
  end

  def by_driver(query, id) do
    query
    |> join(:inner, [driver_booking: db], d in assoc(db, :driver), as: :driver)
    |> where([driver: d], d.user_id == ^id)
  end

  def by_vehicle_owner(query, id) do
    query
    |> where([driver_booking: db], db.user_id == ^id)
  end

  # def by_accepted_status(query, user_id) do
  #   query
  #   |> where([driver_booking: db], db.status == :accepted)
  #   |> order_by([driver_booking: db], desc: db.inserted_at)
  # end

  # def by_pending_status(query, profile_id) do
  #   query
  #   |> where([driver_booking: db], db.status == :pending)
  #   |> order_by([driver_booking: db], desc: db.inserted_at)
  # end

  # def by_rejected_status(query, profile_id) do
  #   query
  #   |> where([driver_booking: db], db.status == :rejected)
  #   |> order_by([driver_booking: db], desc: db.inserted_at)
  # end
end
