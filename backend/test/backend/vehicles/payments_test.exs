defmodule Backend.Vehicles.PaymentsTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Vehicles.{Payments, Payment}

  import Backend.Factory

  setup do
    user = insert(:user, first_name: "Tony", last_name: "Stark")
    user_2 = insert(:user, first_name: "Steve", last_name: "Rogers")
    business_profile = insert(:business_profile, user: user_2)

    driver = insert(:driver, user: user)
    vehicle = insert(:vehicle, business_profile: business_profile)

    vehicle_driver = insert(:vehicle_driver, driver: driver, vehicle: vehicle)

    params = %{
      vehicle_driver_id: vehicle_driver.id,
      price_fixed: %{currency: "ZIG", value: 200}
    }

    %{
      user: user,
      user_2: user_2,
      params: params,
      vehicle_driver: vehicle_driver,
      user: user,
      driver: driver,
      vehicle: vehicle
    }
  end

  describe "create/2" do
    test "successfully creates a payment", %{
      user: user,
      params: params,
      vehicle_driver: vehicle_driver
    } do
      # BroadcastMock
      # |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
      #   assert payload.type == :payment
      # end)

      assert {:ok, %Payment{} = payment} = Payments.create(params)

      preloaded_payment = Repo.preload(payment, vehicle_driver: [driver: :user])

      assert user.first_name == preloaded_payment.vehicle_driver.driver.user.first_name
      assert payment.vehicle_driver_id == vehicle_driver.id
    end

    test "returns error for invalid params" do
      params = %{price_fixed: %{currency: "ZIG", value: 200}}

      assert {:error, %Ecto.Changeset{}} = Payments.create(params)
    end
  end

  describe "update/2" do
    test "successfully updates a payment", %{params: params} do
      # BroadcastMock
      # |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
      #   assert payload.type == :payment
      # end)

      {:ok, payment} = Payments.create(params)

      updated_params = %{price_fixed: %{currency: "ZIG", value: 65}}

      assert {:ok, %Payment{} = updated_payment} = Payments.update(payment, updated_params)
      assert updated_payment.price_fixed.value == Decimal.new(65)
    end
  end

  describe "delete/1" do
    test "successfully deletes a payment", %{params: params} do
      # BroadcastMock
      # |> Mox.expect(:broadcast_from!, 2, fn _pid, topic, event, payload ->
      #   assert payload.type == :payment
      # end)

      {:ok, payment} = Payments.create(params)

      assert {:ok, _} = Payments.delete(payment)
      assert {:error, :not_found} = Payments.get_payment(payment.id)
    end
  end

  describe "get_payment/1" do
    test "returns payment if found", %{user: user, params: params} do
      # BroadcastMock
      # |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
      #   assert payload.type == :payment
      # end)

      {:ok, payment} = Payments.create(params)
      {:ok, %Payment{} = payment} = Payments.get_payment(payment.id)

      preloaded_payment = Repo.preload(payment, vehicle_driver: [driver: :user])

      assert user.id == preloaded_payment.vehicle_driver.driver.user.id
    end

    test "returns error if not found" do
      assert {:error, :not_found} = Payments.get_payment(uuid())
    end
  end

  describe "get_payments/2" do
    test "returns payments if found", %{params: params, vehicle_driver: vehicle_driver} do
      # BroadcastMock
      # |> Mox.expect(:broadcast_from!, fn _pid, topic, event, payload ->
      #   assert payload.type == :payment
      # end)
      Enum.map(1..40, fn _payment ->
        Payments.create(params)
      end)

      params = %{
        vehicle_driver_id: vehicle_driver.id
      }

      {:ok, _payments, %{total_count: total_count}} =
        Payments.get_payments(params, :vehicle_owner)

      assert total_count == 40
    end
  end
end
