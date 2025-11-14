defmodule Backend.Drivers.DriversTest do
  use Backend.DataCase, async: true
  use Backend.MoxCase

  alias Backend.Drivers.{Driver, Drivers}

  import Backend.Factory

  setup do
    user = insert(:user, first_name: "Tony", last_name: "Stark")
    business_profile = insert(:business_profile, user: user)

    session = %{user_id: user.id}

    params = %{
      location: %{lat: "123", lon: "987"},
      business_profile_id: business_profile.id,
      active: true
    }

    %{
      user: user,
      params: params,
      user: user,
      session: session,
      business_profile: business_profile
    }
  end

  describe "create/2" do
    test "successfully creates a driver", %{params: params, session: session} do
      assert {:ok, %Driver{} = driver} = Drivers.create(params, session)

      preloaded_driver = Repo.preload(driver, :user)

      assert preloaded_driver.user.first_name == "Tony"
    end

    test "returns error for invalid params", %{session: session} do
      params = %{location: %{lat: "123", lon: "987"}}

      assert {:error, %Ecto.Changeset{}} = Drivers.create(params, session)
    end
  end

  describe "update/2" do
    test "successfully updates a driver", %{params: params, session: session} do
      {:ok, driver} = Drivers.create(params, session)

      updated_params = %{description: "I drive big trucks"}

      assert {:ok, %Driver{} = updated_payment} = Drivers.update(driver, updated_params)
      assert updated_payment.description == "I drive big trucks"
    end
  end

  describe "delete/1" do
    test "successfully deletes a driver", %{params: params, session: session} do
      {:ok, driver} = Drivers.create(params, session)

      assert {:ok, _} = Drivers.delete(driver)
      assert {:error, :not_found} = Drivers.get_driver(driver.id)
    end
  end

  describe "get_drivers/1" do
    test "returns business_profile drivers if found", %{
      params: params,
      business_profile: business_profile,
      session: session
    } do
      insert_list(10, :driver, active: true)

      {:ok, _driver_1} = Drivers.create(params, session)
      {:ok, _driver_2} = Drivers.create(params, session)

      params = %{business_profile_id: business_profile.id}

      {:ok, _drivers, %{total_count: total_count}} = Drivers.get_drivers(params)

      assert total_count == 2
    end
  end

  describe "get_drivers/2" do
    test "returns drivers if found" do
      insert_list(10, :driver, active: true)

      {:ok, _drivers, %{total_count: total_count}} = Drivers.get_drivers(%{}, :public)

      assert total_count == 10
    end
  end
end
