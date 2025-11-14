defmodule Backend.Ecto.EctoEnums do
  import EctoEnum

  defenum(RoleEnum, :role_enum, [
    :driver,
    :owner,
    :member
  ])

  defenum(ApplicationStatusEnum, :vehicle_application_status_enum, [
    :accepted,
    :rejected,
    :pending
  ])

  defenum(BookingStatusEnum, :booking_status_enum, [
    :accepted,
    :rejected,
    :pending
  ])

  defenum(NotificationsEnum, :notifications_enum, [
    :application,
    :review,
    :tag,
    :profile,
    :payments,
    :system
  ])

  defenum(VehicleTypeEnum, :vehicle_type_enum, [
    :bike,
    :passenger,
    :taxi,
    :truck,
    :lorry
  ])

  defenum(FuelTypeEnum, :fuel_type_enum, [
    :diesel,
    :petrol,
    :electric,
    :hybrid,
    :hydrogen
  ])
end
