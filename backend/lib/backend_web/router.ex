defmodule BackendWeb.Router do
  use BackendWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :authorization do
    plug(Backend.Guardian.AuthAccessPipeline)
  end

  @except_path_actions [:new, :edit]

  scope "/api", BackendWeb do
    pipe_through(:api)
    # unauthenticated paths

    resources("/session/current_session", SessionController, only: [:create, :show, :delete])
    resources("/users/register_user", UserController, only: [:create])
    get("/session/current_user", UserController, :get_current_user)

    # authenticated paths
    scope "/" do
      pipe_through([:authorization])

      resources("/users", UserController, except: @except_path_actions)

      scope("/business_profiles") do
        get("/public", BusinessProfiles.BusinessProfilesController, :public_index)
      end

      resources("/business_profiles", BusinessProfiles.BusinessProfilesController,
        except: @except_path_actions
      )

      scope("/drivers") do
        get("/public", Drivers.DriverController, :public_index)
        get("/show_public", Drivers.DriverController, :show_public)
        get("/user_driver", Drivers.DriverController, :fetch_user_driver)
        post("/upsert", Drivers.DriverController, :upsert)
      end

      resources("/drivers", Drivers.DriverController, except: @except_path_actions)

      scope("/vehicles") do
        get("/vehicle_drivers", Vehicles.VehicleController, :index_management_vehicle)
        get("/public", Vehicles.VehicleController, :index_public)
        post("/update", Vehicles.VehicleController, :update_vehicle)
      end

      resources("/vehicle_drivers", Vehicles.VehicleDriverController, except: @except_path_actions)

      resources("/vehicles", Vehicles.VehicleController, except: @except_path_actions)

      resources("/vehicle_payments", Vehicles.PaymentController, except: @except_path_actions)

      scope("/vehicle_applications") do
        post("/application_seen", Applications.VehicleApplicationController, :set_seen_true)
      end

      resources("/vehicle_applications", Applications.VehicleApplicationController,
        except: @except_path_actions
      )

      resources("/reviews", Reviews.ReviewController, except: @except_path_actions)

      resources("/comments", Reviews.CommentController, except: @except_path_actions)

      resources("/replys", Reviews.ReplyController, except: @except_path_actions)

      scope("/threads") do
        get("/user_threads", Messenger.ThreadController, :get_participant_threads)
        post("/messages_seen", Messenger.ThreadController, :set_seen_true)
      end

      resources("/threads", Messenger.ThreadController, except: @except_path_actions)

      scope("/messages") do
        get("/", Messenger.MessageController, :get_thread_messages)
      end

      resources("/messages", Messenger.MessageController, except: @except_path_actions)
    end
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through([:fetch_session, :protect_from_forgery])

      live_dashboard("/dashboard", metrics: BackendWeb.Telemetry)
      forward("/mailbox", Plug.Swoosh.MailboxPreview)
    end
  end
end
