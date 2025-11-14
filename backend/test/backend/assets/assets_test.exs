defmodule Backend.Assets.AssetsTest do
  use Backend.DataCase, async: true

  alias Backend.Assets.{Assets, Asset}

  import Backend.Factory

  setup do
    vehicle = insert(:vehicle)

    params = %{
      file: %Plug.Upload{
        path: Path.expand("priv/car-test.jpg"),
        filename: "uploads/car-test.jpg"
      },
      vehicle_id: vehicle.id
    }

    %{vehicle: vehicle, params: params}
  end

  describe "upload_and_save/1" do
    test "create Asset when picture is successfully uploaded in aws", %{
      params: params,
      vehicle: vehicle
    } do
      assert {:ok, %Asset{} = asset} = Assets.upload_and_save(params)

      assert asset.vehicle_id == vehicle.id
      assert is_binary(asset.url)
    end
  end

  describe "update_asset_with_file/2" do
    test "update asset with a new image url", %{
      params: params,
      vehicle: vehicle
    } do
      assert {:ok, %Asset{} = asset} = Assets.upload_and_save(params)

      updated_params = %{
        file: %Plug.Upload{
          path: Path.expand("priv/person-test.jpg"),
          filename: "uploads/person-test.jpg"
        }
      }

      assert {:ok, %Asset{} = updated_asset} =
               Assets.update_asset_with_file(asset, updated_params)

      assert updated_asset.vehicle_id == vehicle.id
      assert updated_asset.filename == updated_params.file.filename
      assert updated_asset.url != asset.url
    end
  end
end
