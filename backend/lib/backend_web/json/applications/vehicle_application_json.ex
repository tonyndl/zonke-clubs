defmodule BackendWeb.Applications.VehicleApplicationJSON do
  alias BackendWeb.Drivers.DriverJSON

  def index(%{vehicle_applications: vehicle_applications, paginate: paginate}) do
    %{
      paginate: paginate,
      data:
        for(
          vehicle_application <- vehicle_applications,
          do: show(%{vehicle_application: vehicle_application})
        )
    }
  end

  def index(%{vehicle_applications: vehicle_applications}) do
    for(
      vehicle_application <- vehicle_applications,
      do: show(%{vehicle_application: vehicle_application})
    )
  end

  def show(%{vehicle_application: vehicle_application}) do
    %{
      id: vehicle_application.id,
      status: vehicle_application.status,
      seen: vehicle_application.seen,
      driver: DriverJSON.show(%{driver: vehicle_application.driver}),
      inserted_at: vehicle_application.inserted_at,
      updated_at: vehicle_application.updated_at
    }
  end
end
