defmodule BackendWeb.Router do
  use BackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :authenticated do
    plug Backend.Guardian.AuthPipeline
  end

  pipeline :optional_auth do
    plug Guardian.Plug.Pipeline,
      module: Backend.Guardian,
      error_handler: Backend.Guardian.AuthErrorHandler

    plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
    plug Guardian.Plug.LoadResource, allow_blank: true
    plug Backend.Guardian.CurrentUser, halt_on_error: false
  end

  # Protected routes (authentication required) - MUST come before public routes
  # to ensure specific authenticated routes like /clubs/favorites are matched
  # before parameterized public routes like /clubs/:id
  scope "/api", BackendWeb.API, as: :api do
    pipe_through [:api, :authenticated]

    # User profile
    get "/profile", UserController, :show
    put "/profile", UserController, :update
    put "/profile/account", UserController, :update_account
    put "/profile/password", UserController, :change_password

    # Club likes and favorites
    get "/clubs/favorites", ClubController, :favorites
    post "/clubs/:id/like", ClubController, :like
    delete "/clubs/:id/like", ClubController, :unlike

    # Intentions (authenticated actions)
    get "/intentions/mine", IntentionController, :my_intentions
    post "/intentions", IntentionController, :create
    put "/intentions/:id", IntentionController, :update
    delete "/intentions/:id", IntentionController, :delete

    # Connection Requests
    get "/connection-requests/received", ConnectionRequestController, :received
    get "/connection-requests/sent", ConnectionRequestController, :sent
    get "/connection-requests/thread/:thread_id", ConnectionRequestController, :get_by_thread
    get "/connection-requests/with/:user_id", ConnectionRequestController, :with_user
    post "/connection-requests/batch-delete", ConnectionRequestController, :batch_delete
    post "/connection-requests", ConnectionRequestController, :create
    put "/connection-requests/:id/accept", ConnectionRequestController, :accept
    put "/connection-requests/:id/decline", ConnectionRequestController, :decline
    delete "/connection-requests/:id", ConnectionRequestController, :cancel
    post "/connection-requests/disconnect", ConnectionRequestController, :disconnect_by_thread
    post "/connection-requests/reconnect", ConnectionRequestController, :reconnect_by_thread

    # Messaging
    get "/threads", MessageController, :index
    get "/threads/:id", MessageController, :show
    post "/threads/with-user", MessageController, :get_or_create
    post "/messages", MessageController, :create
    delete "/threads/:id/messages", MessageController, :clear

    # Spending (user-facing)
    get "/spending/history", SpendingController, :history
    get "/spending/stats", SpendingController, :stats
    get "/spending/rankings", SpendingController, :rankings
    get "/spending/club/:club_id", SpendingController, :club_history
    get "/spending/club/:club_id/stats", SpendingController, :club_stats

    # Assets (file uploads)
    post "/assets", AssetController, :create
    get "/assets/:id", AssetController, :show
    put "/assets/:id", AssetController, :update
    delete "/assets/:id", AssetController, :delete

    # Push tokens
    get "/push_tokens", PushTokenController, :index
    post "/push_tokens", PushTokenController, :create
    delete "/push_tokens", PushTokenController, :delete

    # Device location (for proximity-based strobe invites)
    put "/location/device", LocationController, :update_device

    # Strobe (DJ flashlight sync)
    get "/strobe/active", StrobeController, :active_sessions
    get "/strobe/approvals", StrobeController, :my_approvals
    get "/strobe/sessions", StrobeController, :my_sessions
    post "/strobe/clubs/:club_id/request", StrobeController, :request_approval
    delete "/strobe/clubs/:club_id/request", StrobeController, :cancel_request
    post "/strobe/clubs/:club_id/approve", StrobeController, :approve_dj
    delete "/strobe/clubs/:club_id/approve", StrobeController, :revoke_approval
    get "/strobe/clubs/:club_id/approvals", StrobeController, :club_approvals
    get "/strobe/clubs/:club_id/session", StrobeController, :active_session

    # Club check-in (QR wristband scan)
    post "/clubs/:club_id/checkin", CheckinController, :checkin
    delete "/clubs/:club_id/checkin", CheckinController, :checkout
    put "/clubs/:club_id/checkin", CheckinController, :update
    get "/clubs/:club_id/checkin/me", CheckinController, :my_checkin
    get "/clubs/:club_id/checkin/open", CheckinController, :open_users

    # QR code management (club admin generates per-gig codes)
    post "/clubs/:club_id/qr-codes", CheckinController, :create_qr
    get "/clubs/:club_id/qr-codes", CheckinController, :list_qr
    delete "/clubs/:club_id/qr-codes/:id", CheckinController, :delete_qr

    # Posts (club feed)
    post "/posts", PostController, :create
    get "/posts/:id", PostController, :show
    put "/posts/:id", PostController, :update
    delete "/posts/:id", PostController, :delete
    get "/posts/user/me", PostController, :user_posts
    get "/posts/user/:user_id", PostController, :user_posts_by_id
    put "/posts/:id/pin", PostController, :pin
    put "/posts/:id/unpin", PostController, :unpin

    # Post likes
    post "/posts/:post_id/like", PostLikeController, :toggle
  end

  # Admin club setup (under /api/clubs for consistency with frontend)
  # MUST come before public /api/clubs/:id route to avoid route conflicts
  scope "/api/clubs", BackendWeb.Admin, as: :admin_clubs do
    pipe_through [:api, :authenticated]

    post "/setup", ClubController, :setup
    get "/my-club", ClubController, :show
    post "/banner", ClubController, :upload_banner
  end

  # Admin DJ management routes (legacy club-created DJs + schedule management)
  scope "/api", BackendWeb.API, as: :api do
    pipe_through [:api, :authenticated]

    resources "/djs", DJController, except: [:new, :edit]
    resources "/dj-schedules", DJScheduleController, except: [:new, :edit]
  end

  # DJ user profile routes — authenticated specific paths must come before /:id
  scope "/api", BackendWeb.API, as: :api do
    pipe_through [:api, :authenticated]

    put "/dj-profiles/me", DJProfileController, :update_me
    get "/dj-profiles/my-schedules", DJProfileController, :my_schedules
  end

  scope "/api", BackendWeb.API, as: :api do
    pipe_through :api

    get "/dj-profiles", DJProfileController, :index
    get "/dj-profiles/:id", DJProfileController, :show
  end

  # Routes with optional authentication (work for both logged in and logged out users)
  scope "/api", BackendWeb.API, as: :api do
    pipe_through [:api, :optional_auth]

    # Clubs list - returns is_liked if authenticated
    get "/clubs", ClubController, :index

    # Club posts - returns has_liked if authenticated
    get "/clubs/:club_id/posts", PostController, :index
  end

  # Public routes (no authentication required)
  scope "/api", BackendWeb.API, as: :api do
    pipe_through :api

    # Authentication
    post "/login", SessionController, :create
    post "/register", UserController, :create

    # Public QR validation (scanned by mobile app)
    get "/qr/:token", CheckinController, :validate_qr
    get "/clubs/:club_id/qr-codes/active", CheckinController, :active_qr

    # Asset proxy for serving S3 images
    get "/avatars/:filename", AssetProxyController, :proxy_avatar

    # Clubs (public endpoints)
    get "/clubs/:id", ClubController, :show
    get "/clubs/:id/schedule", DJScheduleController, :club_schedule

    # Intentions (public read)
    get "/intentions", IntentionController, :all_intentions
    get "/clubs/:club_id/intentions", IntentionController, :club_intentions

    # Users (public profiles)
    get "/users/:id", UserController, :show_public

    # Locations (public search endpoint)
    get "/locations/search", LocationController, :search
  end

  # Public club events endpoint (uses Admin.EventController)
  scope "/api/clubs", BackendWeb.Admin do
    pipe_through :api

    get "/:id/events", EventController, :club_events
  end

  # Admin routes (separate authentication from regular users)
  # Protected admin routes
  scope "/api/admin", BackendWeb.Admin, as: :admin do
    pipe_through [:api, :authenticated]

    # Admin profile
    get "/profile", AdminController, :show
    put "/profile", AdminController, :update
    put "/profile/password", AdminController, :change_password
    delete "/profile", AdminController, :delete_account

    # Dashboard statistics
    get "/dashboard/stats", AdminController, :dashboard_stats

    # Events management
    delete "/events/past", EventController, :cleanup_past
    resources "/events", EventController, except: [:new, :edit]
    put "/events/:id/publish", EventController, :publish
    put "/events/:id/unpublish", EventController, :unpublish

    # Spending records management
    get "/spending-records", SpendingRecordController, :index
    post "/spending-records", SpendingRecordController, :create
    get "/spending-records/leaderboard", SpendingRecordController, :leaderboard
    get "/spending-records/stats", SpendingRecordController, :stats
    put "/spending-records/:id", SpendingRecordController, :update
    delete "/spending-records/:id", SpendingRecordController, :delete

    # User search (for adding spending records)
    get "/users/search", UserController, :search

    # Posts/Content moderation
    get "/content-moderation", ContentModerationController, :index
    get "/content-moderation/stats", ContentModerationController, :stats
    post "/content-moderation/posts", ContentModerationController, :create
    put "/content-moderation/:id/approve", ContentModerationController, :approve
    put "/content-moderation/:id/reject", ContentModerationController, :reject
    put "/content-moderation/:id", ContentModerationController, :update
    delete "/content-moderation/:id", ContentModerationController, :delete
  end

  # Public admin routes
  scope "/api/admin", BackendWeb.Admin, as: :admin do
    pipe_through :api

    # Admin authentication
    post "/login", SessionController, :create
    post "/register", AdminController, :create
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
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: BackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
