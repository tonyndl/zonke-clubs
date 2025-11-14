defmodule Backend.Bookings.VehicleBookingsTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Utils.BroadcastMock
  alias Backend.Bookings.{VehicleBookings, VehicleBooking}

  import Backend.Factory

  setup do
    user = insert(:user)
    user_2 = insert(:user)
    vehicle = insert(:vehicle, active: true, user: user)

    params = %{
      vehicle_id: vehicle.id
    }

    session = %{user_id: user.id}

    %{user: user, user_2: user_2, params: params, session: session, session: session}
  end

  describe "create/2" do
    test "successfully creates a vehicle_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      assert {:ok, %VehicleBooking{} = vehicle_booking} = VehicleBookings.create(params, session)
      assert vehicle_booking.user_id == user.id
      assert vehicle_booking.status == :pending
    end

    test "returns error for invalid params", %{user: user, session: session} do
      assert {:error, {_reason, %Ecto.Changeset{}}} = VehicleBookings.create(%{}, session)
    end
  end

  describe "update/2" do
    test "successfully updates a vehicle_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, vehicle_booking} = VehicleBookings.create(params, session)

      assert {:ok, %VehicleBooking{} = updated} =
               VehicleBookings.update(vehicle_booking, %{status: :accepted})

      assert updated.status == :accepted
    end
  end

  describe "delete/1" do
    test "successfully deletes a vehicle_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, vehicle_booking} = VehicleBookings.create(params, session)

      assert {:ok, _} = VehicleBookings.delete(vehicle_booking)
      assert {:error, :not_found} = VehicleBookings.get_vehicle_booking(vehicle_booking.id)
    end
  end

  describe "get_vehicle_booking/1" do
    test "returns vehicle_booking if found", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, vehicle_booking} = VehicleBookings.create(params, session)

      {:ok, %VehicleBooking{} = vehicle_booking} =
        VehicleBookings.get_vehicle_booking(vehicle_booking.id)

      assert vehicle_booking.user_id == user.id
    end

    test "returns error if not found", %{user: user, params: params, session: session} do
      assert {:error, :not_found} = VehicleBookings.get_vehicle_booking(uuid())
    end
  end

  describe "get_vehicle_bookings/3" do
    test "returns driver vehicle_bookings if found", %{
      user: user,
      params: params,
      session: session
    } do
      insert_list(10, :vehicle_booking, user: user)
      insert_list(13, :vehicle_booking)

      {:ok, _vehicle_bookings, %{total_count: total_count}} =
        VehicleBookings.get_vehicle_bookings(%{}, session, :driver)

      assert total_count == 10
    end

    test "returns owner vehicle_bookings if found", %{user: user, params: params, user_2: user_2} do
      vehicle = insert(:vehicle, user: user_2)

      insert_list(8, :vehicle_booking, vehicle: vehicle)
      insert_list(15, :vehicle_booking)

      {:ok, _vehicle_bookings, %{total_count: total_count}} =
        VehicleBookings.get_vehicle_bookings(%{}, %{user_id: user_2.id}, :owner)

      assert total_count == 8
    end
  end
end
