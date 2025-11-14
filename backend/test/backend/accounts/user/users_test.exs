defmodule Backend.Accounts.UsersTest do
  use Backend.DataCase, async: true

  alias Backend.Accounts.{User, Users}

  import Backend.Factory

  setup do
    user = insert(:user)

    params = %{
      asset: %{
        file: %Plug.Upload{
          path: Path.expand("priv/person-test.jpg"),
          filename: "uploads/person-test.jpg"
        }
      }
    }

    %{user: user, params: params}
  end

  describe "update/2" do
    test "creates user asset", %{
      params: params,
      user: user
    } do
      assert {:ok, %User{} = updated_user} = Users.update(user, params)

      preloaded_updated_user = Repo.preload(updated_user, :asset)

      assert updated_user.id == user.id
      assert preloaded_updated_user.asset.filename == params.asset.file.filename
      assert is_binary(preloaded_updated_user.asset.url)
    end

    test "updates user and asset", %{
      params: params,
      user: user
    } do
      assert {:ok, %User{} = user_update_1} = Users.update(user, params)

      preloaded_user_update_1 = Repo.preload(user_update_1, :asset)

      updated_params = %{
        asset: %{
          file: %Plug.Upload{
            path: Path.expand("priv/car-test.jpg"),
            filename: "uploads/car-test.jpg"
          }
        },
        first_name: "Lebohang",
        last_name: "Mdlongwa"
      }

      assert {:ok, %User{} = user_update_2} = Users.update(user_update_1, updated_params)

      preloaded_user_update_2 = Repo.preload(user_update_2, :asset)

      assert user_update_2.id == user.id
      assert user_update_2.first_name == updated_params.first_name
      assert user_update_2.last_name == updated_params.last_name
      assert preloaded_user_update_2.asset.filename == updated_params.asset.file.filename
      assert preloaded_user_update_2.asset.url != preloaded_user_update_1.asset.url
    end
  end
end
