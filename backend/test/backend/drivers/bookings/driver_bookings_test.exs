defmodule Backend.Bookings.DriverBookingsTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Utils.BroadcastMock
  alias Backend.Bookings.{DriverBookings, DriverBooking}

  import Backend.Factory

  setup do
    user = insert(:user)
    user_2 = insert(:user)
    driver = insert(:driver, active: true, user: user)

    params = %{
      driver_id: driver.id
    }

    session = %{user_id: user.id}

    %{user: user, user_2: user_2, params: params, session: session, session: session}
  end

  describe "create/2" do
    test "successfully creates a driver_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      assert {:ok, %DriverBooking{} = driver_booking} = DriverBookings.create(params, session)
      assert driver_booking.user_id == user.id
      assert driver_booking.status == :pending
    end

    test "returns error for invalid params", %{user: user, session: session} do
      assert {:error, {_reason, %Ecto.Changeset{}}} = DriverBookings.create(%{}, session)
    end
  end

  describe "update/2" do
    test "successfully updates a driver_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, driver_booking} = DriverBookings.create(params, session)

      assert {:ok, %DriverBooking{} = updated} =
               DriverBookings.update(driver_booking, %{status: :accepted})

      assert updated.status == :accepted
    end
  end

  describe "delete/1" do
    test "successfully deletes a driver_booking", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, driver_booking} = DriverBookings.create(params, session)

      assert {:ok, _} = DriverBookings.delete(driver_booking)
      assert {:error, :not_found} = DriverBookings.get_driver_booking(driver_booking.id)
    end
  end

  describe "get_driver_booking/1" do
    test "returns driver_booking if found", %{user: user, params: params, session: session} do
      BroadcastMock
      |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
        assert payload.type == :booking
      end)

      {:ok, driver_booking} = DriverBookings.create(params, session)

      {:ok, %DriverBooking{} = driver_booking} =
        DriverBookings.get_driver_booking(driver_booking.id)

      assert driver_booking.user_id == user.id
    end

    test "returns error if not found", %{user: user, params: params, session: session} do
      assert {:error, :not_found} = DriverBookings.get_driver_booking(uuid())
    end
  end

  describe "get_driver_bookings/3" do
    test "returns driver vehicle_bookings if found", %{
      user: user,
      params: params,
      session: session
    } do
      driver = insert(:driver, user: user)

      insert_list(10, :driver_booking, driver: driver)
      insert_list(13, :driver_booking)

      {:ok, _vehicle_bookings, %{total_count: total_count}} =
        DriverBookings.get_driver_bookings(%{}, session, :driver)

      assert total_count == 10
    end

    test "returns owner vehicle_bookings if found", %{user: user, params: params, user_2: user_2} do
      insert_list(8, :driver_booking, user: user_2)
      insert_list(15, :driver_booking)

      {:ok, _vehicle_bookings, %{total_count: total_count}} =
        DriverBookings.get_driver_bookings(%{}, %{user_id: user_2.id}, :owner)

      assert total_count == 8
    end
  end
end
