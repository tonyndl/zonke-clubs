defmodule Backend.Accounts.BusinessProfileTest do
  use Backend.DataCase, async: true

  alias Backend.Accounts.{BusinessProfile, BusinessProfiles}

  import Backend.Factory

  setup do
    user = insert(:user)

    {:ok, tmp} = Briefly.create()
    File.write!(tmp, "test file content")

    asset = %{file_path: tmp, filename: "uploads/test.png"}

    params = %{
      description: "We deliver goods",
      name: "Zonke Deliveries",
      location: %{"lat" => 0.0, "lng" => 0.0},
      asset: asset
    }

    session = %{user_id: user.id}

    %{user: user, params: params, session: session}
  end

  describe "create/2" do
    test "successfully creates a business_profile", %{
      user: user,
      params: params,
      session: session
    } do
      assert {:ok, %BusinessProfile{} = business_profile} =
               BusinessProfiles.create(params, session)

      preloaded_profile = Repo.preload(business_profile, :asset)

      assert preloaded_profile.user_id == user.id
      assert preloaded_profile.active == false
      assert preloaded_profile.asset.business_profile_id == business_profile.id
    end

    test "returns error for invalid params", %{user: user, session: session} do
      params = %{name: nil, location: nil}

      assert {:error, _reason, %Ecto.Changeset{}} = BusinessProfiles.create(params, session)
    end
  end

  describe "update/2" do
    test "successfully updates a business_profile", %{
      user: user,
      params: params,
      session: session
    } do
      {:ok, %BusinessProfile{} = business_profile} = BusinessProfiles.create(params, session)

      assert {:ok, %BusinessProfile{} = updated} =
               BusinessProfiles.update(business_profile, %{active: true})

      assert updated.active == true
    end
  end

  describe "get_business_profiles/1" do
    test "returns business_profile if found", %{user: user, params: params, session: session} do
      {:ok, %BusinessProfile{} = business_profile} = BusinessProfiles.create(params, session)

      {:ok, %BusinessProfile{} = business_profile} =
        BusinessProfiles.get_business_profile(business_profile.id)

      assert business_profile.user_id == user.id
    end

    test "returns error if not found", %{user: user, params: params} do
      assert {:error, :not_found} = BusinessProfiles.get_business_profile(uuid())
    end
  end

  describe "delete/1" do
    test "successfully deletes a business_profile", %{user: user, params: params} do
      {:ok, %BusinessProfile{} = business_profile} =
        BusinessProfiles.create(params, %{user_id: user.id})

      assert {:ok, _} = BusinessProfiles.delete(business_profile)
      assert {:error, :not_found} = BusinessProfiles.get_business_profile(business_profile.id)
    end

    # test "doesn't delete when active booiking exists", %{user: user, params: params} do
    #   {:ok, %BusinessProfile{} = business_profile} =
    #     BusinessProfiles.create(params, %{user_id: user.id})

    #   service = insert(:service, user: user, business_profile: business_profile)
    #   booking = insert(:booking, status: :active, service: service)

    #   assert {:ok, :active_booking_exists} = BusinessProfiles.delete(business_profile)
    # end
  end
end
