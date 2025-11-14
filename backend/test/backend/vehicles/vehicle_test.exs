defmodule Backend.Vehicles.VehiclesTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Vehicles.{Vehicle, Vehicles}

  import Backend.Factory

  setup do
    user = insert(:user)
    business_profile = insert(:business_profile, user: user)

    {:ok, tmp} = Briefly.create()
    File.write!(tmp, "test file content")

    asset = %{file_path: tmp, filename: "uploads/test.png"}

    params = %{
      name: "Mazda G40",
      price_fixed: %{currency: "ZIG", value: 200},
      active: true,
      business_profile_id: business_profile.id,
      asset: asset
    }

    session = %{user_id: user.id}

    %{
      params: params,
      business_profile: business_profile,
      session: session,
      user: user
    }
  end

  describe "create/2" do
    test "successfully creates a vehicle", %{
      params: params,
      business_profile: business_profile,
      session: session
    } do
      assert {:ok, %Vehicle{} = vehicle} = Vehicles.create(params, session)

      preloaded_vehicle = Repo.preload(vehicle, :asset)

      assert preloaded_vehicle.business_profile_id == business_profile.id
      assert is_binary(preloaded_vehicle.asset.url)
    end

    test "returns error for invalid params", %{session: session} do
      params = %{name: "Mazda G40"}

      assert {:error, :vehicle, %Ecto.Changeset{}} = Vehicles.create(params, session)
    end
  end

  describe "update/2" do
    test "successfully updates a vehicle", %{params: params, session: session} do
      {:ok, vehicle} = Vehicles.create(params, session)

      updated_params = %{price_fixed: %{currency: "ZIG", value: 150}}

      assert {:ok, %Vehicle{} = updated_vehicle} = Vehicles.update(vehicle, updated_params)
      assert updated_vehicle.price_fixed.value == Decimal.new(150)
    end
  end

  describe "delete/1" do
    test "successfully deletes a vehicle", %{params: params, session: session} do
      {:ok, vehicle} = Vehicles.create(params, session)

      assert {:ok, _} = Vehicles.delete(vehicle)
      assert {:error, :not_found} = Vehicles.get_vehicle(vehicle.id)
    end
  end

  describe "get_vehicle/2" do
    test "returns public vehicle if found", %{params: params, session: session} do
      {:ok, vehicle} = Vehicles.create(params, session)
      {:ok, %{id: id}} = Vehicles.get_vehicle(vehicle.id, :public)

      assert id == vehicle.id
    end
  end

  describe "get_management_vehicles/3" do
    test "returns business_profile vehicles if found", %{
      params: params,
      business_profile: business_profile,
      session: session,
      user: user
    } do
      vehicle = insert(:vehicle, user: user, active: true)
      driver = insert(:driver)
      vehicle_driver = insert(:vehicle_driver, vehicle: vehicle, driver: driver)
      insert_list(10, :vehicle, active: true)

      {:ok, drivers, %{total_count: total_count}} =
        Vehicles.get_management_vehicles(%{}, session, :owner)

      assert total_count == 1
    end
  end

  describe "get_vehicles/1" do
    test "returns business_profile vehicles if found", %{
      params: params,
      business_profile: business_profile,
      session: session
    } do
      insert_list(10, :vehicle, active: true)

      {:ok, _vehicle_1} = Vehicles.create(params, session)
      {:ok, _vehicle_2} = Vehicles.create(params, session)

      params = %{business_profile_id: business_profile.id}

      {:ok, _drivers, %{total_count: total_count}} = Vehicles.get_vehicles(params)

      assert total_count == 2
    end
  end

  describe "get_vehicles/2" do
    test "returns vehicles if found" do
      insert_list(10, :vehicle, active: true)

      {:ok, _drivers, %{total_count: total_count}} = Vehicles.get_vehicles(%{}, :public)

      assert total_count == 10
    end
  end
end
