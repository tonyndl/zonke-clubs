defmodule Backend.Drivers.Queries.DriverBy do
  alias Backend.Drivers.Driver
  import Ecto.Query

  def base_query do
    from(d in Driver,
      as: :driver
    )
  end

  def by_id(query, id) do
    where(query, [driver: d], d.id == ^id)
  end

  def by_user(query, id) do
    where(query, [driver: d], d.user_id == ^id)
  end

  def by_active_status(query) do
    query
    |> where([driver: d], d.active)
  end
end
