defmodule Backend.Drivers.Drivers do
  alias Backend.{Repo, PaginateHelper, EmptyFieldsHelper}
  alias Backend.Drivers.{Driver, Policy, Queries.DriverBy}
  alias Backend.Vehicles.VehicleDriver
  alias Backend.Reviews.Review
  alias Backend.Accounts.Users

  import Ecto.Query

  defdelegate authorize(action, params, session), to: Policy

  @user_fields [:asset, :first_name, :last_name, :email]
  @user_preloads [user: :asset]

  def create(params, %{user_id: user_id}) do
    params =
      params
      |> Map.put(:user_id, user_id)

    %Driver{}
    |> Driver.changeset(params)
    |> Repo.insert()
  end

  def update_or_create(params, user_id) do
    {user_params, driver_params} = Map.split(params, @user_fields)

    with {:ok, _user} <- maybe_update_user(user_id, user_params),
         {:ok, driver} <- maybe_update_driver(user_id, driver_params) do
      {:ok, Repo.preload(driver, @user_preloads)}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp maybe_update_user(user_id, params) do
    case EmptyFieldsHelper.map_has_non_empty_fields?(params) do
      true ->
        {:ok, user} = Users.get_user_by(id: user_id)
        Users.update(user, params)

      _ ->
        {:ok, :no_user_params}
    end
  end

  defp maybe_update_driver(user_id, params) do
    cleaned_params =
      params
      |> Enum.reject(fn {_k, v} -> is_nil(v) or v == "" end)
      |> Enum.into(%{})

    decoded_params =
      Map.update(cleaned_params, :location, %{}, fn val ->
        if is_binary(val), do: Jason.decode!(val), else: val
      end)

    case get_user_driver(user_id) do
      {:ok, driver} ->
        if map_size(decoded_params) > 0 do
          case update_driver(driver, decoded_params) do
            {:ok, driver} -> get_driver(driver.id, :public)
            {:error, error} -> {:error, error}
          end
        else
          {:ok, driver}
        end

      {:error, :not_found} ->
        case create(decoded_params, %{user_id: user_id}) do
          {:ok, driver} -> get_driver(driver.id, :public)
          {:error, error} -> {:error, error}
        end
    end
  end

  def update_driver(driver, params) do
    driver
    |> Driver.changeset(params)
    |> Repo.update()
  end

  def get_user_driver(user_id) do
    from(d in Driver,
      as: :driver,
      where: d.user_id == ^user_id
    )
    |> add_extra_fields()
    |> Repo.one()
    |> format_driver()
  end

  def delete(%Driver{id: id} = driver) do
    # check if there's pending accepted booking
    # allow delete if 0 otherwise reject delete
    Repo.delete(driver)
  end

  def get_driver(id) do
    Repo.get_by(Driver, id: id)
    |> format_driver()
  end

  def get_driver(id, :public) do
    DriverBy.base_query()
    |> DriverBy.by_id(id)
    |> add_extra_fields()
    |> Repo.one()
    |> format_driver()
  end

  def get_drivers(params, %{user_id: user_id}) do
    data =
      DriverBy.base_query()
      |> DriverBy.by_user(user_id)
      |> add_extra_fields()
      |> Repo.paginate(PaginateHelper.prep_params(params))

    {:ok, data, PaginateHelper.prep_paginate(data)}
  end

  def get_drivers(params, :public) do
    data =
      DriverBy.base_query()
      # |> DriverBy.by_active_status()
      |> add_extra_fields()
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

      {:age_range, [min, max]}, query when min != "18" or max != "70" ->
        min = String.to_integer(min)
        max = String.to_integer(max)

        where(
          query,
          [driver: d],
          fragment("DATE_PART('year', AGE(?)) BETWEEN ? AND ?", d.dob, ^min, ^max)
        )

      {:experience_range, [min, max]}, query when min != "0" or max != "52" ->
        min = String.to_integer(min)
        max = String.to_integer(max)

        where(query, [driver: d], d.experience >= ^min and d.experience <= ^max)

      {:rating_range, val}, query when is_binary(val) and val != "" ->
        rating = String.to_integer(val)
        where(query, [rating: r], coalesce(r.avg_rating, 0) >= ^rating)

      {:platforms, val}, query when is_list(val) ->
        where(query, [driver: d], fragment("? && ?", d.platforms, ^val))

      {:licences, val}, query when is_list(val) ->
        where(query, [driver: d], fragment("? && ?", d.licences, ^val))

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

  def add_extra_fields(query) do
    subquery =
      from(vd in VehicleDriver,
        where: vd.driver_id == parent_as(:driver).id,
        select: %{
          previous_vehicles: count(vd.id),
          total_accidents: coalesce(sum(vd.accidents), 0)
        }
      )

    rating_subquery =
      from(r in Review,
        where: r.driver_id == parent_as(:driver).id,
        select: %{avg_rating: fragment("ROUND(AVG(?)::numeric, 1)", r.rating)}
      )

    query
    |> join(:inner, [driver: d], u in assoc(d, :user), as: :user)
    |> join(:left, [user: u], a in assoc(u, :asset), as: :asset)
    |> join(:left_lateral, [driver: d], vd_stats in subquery(subquery), as: :vd_stats)
    |> join(:left_lateral, [driver: d], rating in subquery(rating_subquery), as: :rating, on: true)
    |> select_merge([driver: d, user: u, vd_stats: vd_stats, rating: rating, asset: a], %{
      d
      | email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
        user_id: u.id,
        previous_vehicles: vd_stats.previous_vehicles,
        total_accidents: vd_stats.total_accidents,
        rating: coalesce(rating.avg_rating, 0),
        asset_filename: a.filename
    })
  end

  def format_driver(%Driver{} = driver), do: {:ok, driver}
  def format_driver(nil), do: {:error, :not_found}
end
