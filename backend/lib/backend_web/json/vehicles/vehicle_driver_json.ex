defmodule BackendWeb.Vehicles.VehicleDriverJSON do
  alias BackendWeb.Drivers.DriverJSON

  def index(%{vehicle_drivers: vehicle_drivers, paginate: paginate}) do
    %{
      paginate: paginate,
      data: for(vehicle_driver <- vehicle_drivers, do: show(%{vehicle_driver: vehicle_driver}))
    }
  end

  def index(%{vehicle_drivers: vehicle_drivers}) do
    for(vehicle_driver <- vehicle_drivers, do: show(%{vehicle_driver: vehicle_driver}))
  end

  def show(%{vehicle_driver: vehicle_driver}) do
    %{
      id: vehicle_driver.id,
      driver: DriverJSON.show(%{driver: vehicle_driver.driver}),
      active: vehicle_driver.active,
      payment_count: vehicle_driver.payment_count,
      total_payments: vehicle_driver.total_payments,
      last_payment: vehicle_driver.last_payment,
      inserted_at: vehicle_driver.inserted_at,
      updated_at: vehicle_driver.updated_at
    }
  end
end
