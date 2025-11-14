defmodule Backend.Vehicles.Vehicles do
  alias Backend.Accounts.{BusinessProfiles, User, BusinessProfile}
  alias Backend.{Repo, PaginateHelper}
  alias Backend.Vehicles.{Vehicle, Payment, VehicleDriver}
  alias Backend.Vehicles.Queries.{VehicleDriverBy, VehicleBy}
  alias Backend.Applications.VehicleApplication
  alias Backend.Reviews.Review
  alias Backend.Assets.{Assets, Asset}
  alias Backend.Drivers.{Driver, Drivers}
  alias Ecto.Multi

  import Ecto.Query

  # defdelegate authorize(action, params, session), to: Policy

  def create(params, %{user_id: user_id}) do
    decoded_params =
      Map.update(params, :price_fixed, %{}, fn val ->
        if is_binary(val), do: Jason.decode!(val), else: val
      end)

    vehicle_params =
      decoded_params
      |> Map.delete(:asset)
      |> Map.merge(%{user_id: user_id, active: true})

    Multi.new()
    |> Multi.insert(
      :vehicle,
      Vehicle.changeset(%Vehicle{}, vehicle_params)
    )
    |> Multi.run(:asset, fn _repo, %{vehicle: vehicle} ->
      asset_params =
        params
        |> Map.get(:asset, %{})
        |> Map.put(:vehicle_id, vehicle.id)

      Assets.upload_and_save(asset_params)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{vehicle: vehicle}} ->
        {:ok, Repo.preload(vehicle, :asset)}

      {:error, step, reason, changes_so_far} ->
        {:error, step, reason}
    end
  end

  def update(%Vehicle{} = vehicle, params) do
    {asset_params, vehicle_params} = Map.pop(params, :asset)

    with {:ok, _asset} <- maybe_handle_asset(vehicle, asset_params),
         {:ok, _vehicle} <- maybe_update_vehicle(vehicle, vehicle_params),
         updated_vehicle <- Repo.get(Vehicle, vehicle.id) |> Repo.preload(:asset) do
      # IO.inspect(updated_vehicle)
      {:ok, updated_vehicle}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp maybe_handle_asset(_vehicle, nil), do: {:ok, :no_asset}

  defp maybe_handle_asset(vehicle, %{file: _} = asset_params),
    do: update_vehicle_asset(vehicle.id, asset_params)

  defp maybe_handle_asset(_vehicle, _), do: {:ok, :no_file_in_asset}

  def update_vehicle_asset(vehicle_id, params) do
    get_vehicle_asset(vehicle_id)
    |> Assets.update_asset_with_file(params)
  end

  defp maybe_update_vehicle(vehicle, params) do
    cleaned_params =
      params
      |> Enum.reject(fn {_k, v} -> is_nil(v) or v == "" end)
      |> Enum.into(%{})

    if map_size(cleaned_params) > 0 do
      decoded_params =
        Map.update(cleaned_params, :price_fixed, %{}, fn val ->
          if is_binary(val), do: Jason.decode!(val), else: val
        end)

      vehicle
      |> Vehicle.changeset(decoded_params)
      |> Repo.update()
    else
      {:ok, vehicle}
    end
  end

  def get_vehicle_asset(vehicle_id) do
    from(a in Asset,
      where: a.vehicle_id == ^vehicle_id
    )
    |> Repo.one()
  end

  def delete(%Vehicle{id: id} = vehicle) do
    Repo.delete(vehicle)
  end

  def get_vehicle(id) do
    Repo.get_by(Vehicle, id: id)
    |> format_vehicle()
  end

  def get_vehicle(id, :public) do
    VehicleBy.base_query()
    |> VehicleBy.by_id(id)
    |> VehicleBy.by_active_status()
    |> Repo.one()
    |> format_vehicle()
  end

  def get_vehicles(params, %{user_id: user_id}) do
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

    total_query =
      from(p in Payment,
        group_by: p.vehicle_driver_id,
        select: %{
          vehicle_driver_id: p.vehicle_driver_id,
          total_amount: sum(fragment("CAST(?->>'value' AS DECIMAL)", p.price_fixed)),
          payment_count: count(p.id)
        }
      )

    last_payment_query =
      from(p in Payment,
        distinct: p.vehicle_driver_id,
        order_by: [desc: p.inserted_at],
        select: %{
          vehicle_driver_id: p.vehicle_driver_id,
          last_payment: fragment("CAST(?->>'value' AS DECIMAL)", p.price_fixed)
        }
      )

    unseen_va_count_subquery =
      from(va in VehicleApplication,
        where:
          va.seen == false and
            va.vehicle_id == parent_as(:vehicle).id,
        select: %{count: count(va.id)}
      )

    data =
      VehicleBy.base_query()
      |> VehicleBy.by_user(user_id)
      |> join(:left, [v], vd in VehicleDriver, on: v.id == vd.vehicle_id and vd.active == true)
      |> join(:left_lateral, [v], uc in subquery(unseen_va_count_subquery),
        as: :unseen_count,
        on: true
      )
      |> select_merge([vehicle: v, unseen_count: uc], %{
        v
        | unseen_applications_count: coalesce(uc.count, 0)
      })
      |> preload([
        :asset,
        vehicle_drivers: ^from(vd in VehicleDriver, where: vd.active == true, preload: [driver: ^driver_query])
      ])
      |> Repo.paginate(PaginateHelper.prep_params(params))

    updated_data = %{data | entries: load_vehicle_drivers_with_payments(total_query, last_payment_query, data.entries)}

    {:ok, updated_data, PaginateHelper.prep_paginate(data)}
  end

  defp load_vehicle_drivers_with_payments(total_query, last_payment_query, data) do
    totals_map =
      total_query
      |> Repo.all()
      |> Map.new(fn %{vehicle_driver_id: id, total_amount: total, payment_count: count} ->
        {id, %{total: total || Decimal.new(0), count: count || 0}}
      end)

    last_payments_map =
      last_payment_query
      |> Repo.all()
      |> Map.new(fn %{vehicle_driver_id: id, last_payment: val} ->
        {id, val || Decimal.new(0)}
      end)

    Enum.map(data, fn vehicle ->
      vehicle_drivers =
        Enum.map(vehicle.vehicle_drivers, fn vd ->
          totals = Map.get(totals_map, vd.id, %{total: Decimal.new(0), count: 0})
          last_payment = Map.get(last_payments_map, vd.id, Decimal.new(0))

          vd
          |> Map.put(:total_payments, totals.total)
          |> Map.put(:payment_count, totals.count)
          |> Map.put(:last_payment, last_payment)
        end)

      %{vehicle | vehicle_drivers: vehicle_drivers}
    end)
  end

  def get_vehicles(params, :public) do
    data =
      VehicleBy.base_query()
      |> VehicleBy.by_active_status()
      |> join(:inner, [vehicle: v], u in assoc(v, :user), as: :user)
      |> join(:left, [user: u], a in assoc(u, :asset), as: :asset)
      |> join(:left, [v], vd in VehicleDriver, on: v.id == vd.vehicle_id and vd.active == true, as: :vehicle_driver)
      |> where([vehicle: v, vehicle_driver: vd], is_nil(vd.id))
      |> select_merge([vehicle: v, user: u, asset: a], %{
        v
        | user: %{
            id: u.id,
            asset: a
          }
      })
      |> preload(:asset)
      |> build_search(params)
      |> build_sort(params)
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  defp build_search(query, params) do
    filters = Map.get(params, :filters, %{})

    Enum.reduce(filters, query, fn
      {:search_term, value}, query when is_binary(value) and value != "" ->
        query
        |> select_merge([s], %{
          rank_value:
            fragment(
              "ts_rank(?, websearch_to_tsquery(?)) AS rank_value",
              s.searchable_document,
              ^filters.search_term
            )
        })
        |> where(
          [s],
          fragment("? @@ websearch_to_tsquery(?)", s.searchable_document, ^value)
        )

      {:brands, val}, query ->
        where(query, [vehicle: v], v.brand in ^val)

      {:types, val}, query ->
        where(query, [vehicle: v], v.type in ^val)

      {:fuel_types, val}, query ->
        where(query, [vehicle: v], v.fuel_type in ^val)

      {:price_range, [min, max]}, query ->
        min = String.to_integer(min)
        max = String.to_integer(max)

        where(
          query,
          [vehicle: v],
          fragment("CAST((?->>'value') AS DECIMAL)", v.price_fixed) >= ^min and
            fragment("CAST((?->>'value') AS DECIMAL)", v.price_fixed) <= ^max
        )

      _, query ->
        query
    end)
  end

  defp build_sort(query, params) do
    order_by_param = Map.get(params, :order_by, %{by: :relevance, direction: :desc})
    criteria = Map.get(order_by_param, :by)
    direction = Map.get(order_by_param, :direction)

    search_term = get_in(params, [:filters, :search_term])

    case criteria do
      :relevance when is_binary(search_term) and search_term != "" ->
        order_by(query, [s], [{^direction, fragment("rank_value")}, {:asc, s.id}])

      _ ->
        query
    end
  end

  defp format_vehicle(%Vehicle{} = vehicle), do: {:ok, vehicle}
  defp format_vehicle(nil), do: {:error, :not_found}
end
