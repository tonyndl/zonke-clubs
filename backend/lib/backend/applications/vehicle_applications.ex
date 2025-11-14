defmodule Backend.Applications.VehicleApplications do
  alias Ecto.Multi
  alias Backend.Applications.VehicleApplication
  alias Backend.Notifications.Notifications
  alias Backend.Applications.Queries.VehicleApplicationBy
  alias Backend.Drivers.{Drivers, Driver}
  alias Backend.{Repo, PaginateHelper}

  import Ecto.Query

  def create(params, %{user_id: user_id}) do
    case get_user_driver(user_id) do
      {:ok, driver} ->
        updated_params = Map.put(params, :driver_id, driver.id)

        %VehicleApplication{}
        |> VehicleApplication.changeset(updated_params)
        |> Repo.insert()

      {:error, :not_found} ->
        {:error, :no_driver_profile}
    end
  end

  defp get_user_driver(user_id) do
    from(d in Driver,
      as: :driver,
      where: d.user_id == ^user_id
    )
    |> Repo.one()
    |> Drivers.format_driver()
  end

  def get_application_by_vehicle_driver(vehicle_id, driver_id) do
    VehicleApplicationBy.base_query()
    |> VehicleApplicationBy.by_vehicle(vehicle_id)
    |> VehicleApplicationBy.by_driver(driver_id)
    |> Repo.one()
    |> format_vehicle_application()
  end

  def update(%VehicleApplication{} = vehicle_application, params) do
    vehicle_application
    |> VehicleApplication.changeset(params)
    |> Repo.update()
  end

  def delete(%VehicleApplication{} = vehicle_application) do
    Repo.delete(vehicle_application)
  end

  def get_vehicle_application(id) do
    Repo.get_by(VehicleApplication, id: id)
    |> format_vehicle_application()
  end

  def get_vehicle_applications(params) do
    data =
      VehicleApplicationBy.base_query()
      |> VehicleApplicationBy.by_vehicle(params.vehicle_id)
      # |> build_sort_all()
      |> order_by([va], desc: va.inserted_at)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    applications_with_drivers =
      Enum.map(data.entries, fn vehicle_application ->
        {:ok, driver} = Drivers.get_driver(vehicle_application.driver_id, :public)
        Map.put(vehicle_application, :driver, driver)
      end)

    {:ok, applications_with_drivers, PaginateHelper.prep_paginate(data)}
  end

  def set_va_seen_true(va_id) do
    {count, _} =
      from(va in VehicleApplication,
        where: va.vehicle_id == ^va_id,
        where: va.seen == false,
        update: [set: [seen: true]]
      )
      |> Repo.update_all([])

    {:ok, count}
  end

  # def get_vehicle_applications(params, %{user_id: user_id}, :owner) do
  #   data =
  #     VehicleApplicationBy.base_query()
  #     |> VehicleApplicationBy.by_vehicle_owner(user_id)
  #     |> build_sort_all()
  #     |> Repo.paginate(PaginateHelper.prep_params(params))

  #   {:ok, data, PaginateHelper.prep_paginate(data)}
  # end

  # def get_pending_vehicle_applications(profile_id) do
  #   VehicleApplicationBy.base_query()
  #   |> VehicleApplicationBy.by_pending_status(profile_id)
  #   |> Repo.all()
  # end

  # def get_accepted_vehicle_applications(profile_id) do
  #   VehicleApplicationBy.base_query()
  #   |> VehicleApplicationBy.by_active_status(profile_id)
  #   |> Repo.all()
  # end

  # def get_rejected_vehicle_applications(profile_id) do
  #   VehicleApplicationBy.base_query()
  #   |> VehicleApplicationBy.by_delivered_status(profile_id)
  #   |> Repo.all()
  # end

  # def build_sort_all(query) do
  #   query
  #   |> order_by(
  #     [vehicle_applications: va],
  #     [
  #       fragment(
  #         "CASE
  #         WHEN ? = ? THEN 1
  #         WHEN ? = ? THEN 2
  #         WHEN ? = ? THEN 3
  #       END",
  #         va.status,
  #         "pending",
  #         va.status,
  #         "accepted",
  #         va.status,
  #         "rejected"
  #       ),
  #       desc: va.inserted_at
  #     ]
  #   )
  # end

  defp format_vehicle_application(%VehicleApplication{} = vehicle_application),
    do: {:ok, vehicle_application}

  defp format_vehicle_application(nil), do: {:error, :not_found}
end
