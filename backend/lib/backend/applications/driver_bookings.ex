defmodule Backend.Applications.DriverBookings do
  alias Ecto.Multi
  alias Backend.Applications.DriverBooking
  alias Backend.Notifications.Notifications
  alias Backend.Bookings.Queries.DriverBookingBy
  alias Backend.{Repo, PaginateHelper}

  import Ecto.Query

  def create(params, %{user_id: user_id}) do
    params = Map.put(params, :user_id, user_id)

    Multi.new()
    |> Multi.insert(
      :driver_booking,
      DriverBooking.changeset(%DriverBooking{}, params)
    )
    |> Multi.run(:notification, fn _repo, %{driver_booking: driver_booking} ->
      Notifications.create(driver_booking, user_id, %{booking: :created})
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      {:ok, %{driver_booking: driver_booking}} -> {:ok, driver_booking}
    end
  end

  def update(%DriverBooking{} = driver_booking, params) do
    Multi.new()
    |> Multi.update(
      :driver_booking,
      DriverBooking.changeset(driver_booking, params)
    )
    |> Multi.run(:notification, fn _repo, %{driver_booking: driver_booking} ->
      Notifications.create(driver_booking, driver_booking.user_id, %{booking: :updated})
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      {:ok, %{driver_booking: driver_booking}} -> {:ok, driver_booking}
    end
  end

  def delete(%DriverBooking{} = driver_booking) do
    Multi.new()
    |> Multi.delete(:driver_booking, driver_booking)
    |> Multi.run(:notification, fn _repo, %{driver_booking: driver_booking} ->
      Notifications.create(driver_booking, driver_booking.user_id, %{booking: :deleted})
    end)
    |> Repo.transaction()
    |> case do
      {:error, reason, failed_value, _changes} -> {:error, {reason, failed_value}}
      {:ok, _booking} -> {:ok, _booking}
    end
  end

  def get_driver_booking(id) do
    Repo.get_by(DriverBooking, id: id)
    |> format_driver_booking()
  end

  def get_driver_bookings(params, %{user_id: user_id}, :driver) do
    data =
      DriverBookingBy.base_query()
      |> DriverBookingBy.by_driver(user_id)
      |> build_sort_all()
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  def get_driver_bookings(params, %{user_id: user_id}, :owner) do
    data =
      DriverBookingBy.base_query()
      |> DriverBookingBy.by_vehicle_owner(user_id)
      |> build_sort_all()
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  # def get_pending_vehicle_bookings(profile_id) do
  #   data =
  #     DriverBookingBy.base_query()
  #     |> DriverBookingBy.by_pending_status(profile_id)
  #     |> Repo.paginate(PaginateHelper.prep_params(params))

  #   {:ok, data, PaginateHelper.prep_paginate(data)}
  # end

  # def get_accepted_vehicle_bookings(profile_id) do
  #   data =
  #     DriverBookingBy.base_query()
  #     |> DriverBookingBy.by_vehicle_owner(params.id)
  #     |> DriverBookingBy.by_accepted_status(user_id)
  #     |> Repo.paginate(PaginateHelper.prep_params(params))

  #   {:ok, data, PaginateHelper.prep_paginate(data)}
  # end

  # def get_rejected_vehicle_bookings(profile_id) do
  #   data =
  #     DriverBookingBy.base_query()
  #     |> DriverBookingBy.by_rejected_status(profile_id)
  #     |> Repo.paginate(PaginateHelper.prep_params(params))

  #   {:ok, data, PaginateHelper.prep_paginate(data)}
  # end

  def build_sort_all(query) do
    query
    |> order_by(
      [driver_booking: b],
      [
        fragment(
          "CASE
          WHEN ? = ? THEN 1
          WHEN ? = ? THEN 2
          WHEN ? = ? THEN 3
        END",
          b.status,
          "pending",
          b.status,
          "accepted",
          b.status,
          "rejected"
        ),
        desc: b.inserted_at
      ]
    )
  end

  defp format_driver_booking(%DriverBooking{} = driver_booking), do: {:ok, driver_booking}
  defp format_driver_booking(nil), do: {:error, :not_found}
end
