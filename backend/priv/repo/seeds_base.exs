require Logger

alias Backend.Repo
alias Backend.Accounts.{User, BusinessProfile, Membership}
alias Faker.{Person, Company, Internet, Address}
alias Backend.Messenger.Schemas.{ThreadParticipant, Message}
alias Backend.Messenger.Threads
# alias Backend.Bookings.Booking
alias Backend.Reviews.{Review, Reply}
alias Backend.Tags.Tag
alias Backend.TestExample.Participant
alias Backend.Vehicles.{Vehicle, VehicleDriver, Payment}
alias Backend.Drivers.Driver
alias Backend.Assets.Assets
alias Backend.Applications.VehicleApplication
alias Backend.Reviews.Comment
# alias Backend.Posts.Post
alias Backend.Ecto.EctoEnums

# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds_base.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Backend.Repo.insert!(%Backend.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

# Create client users without business profiles
#####################################################################################################

Logger.info("Creating users with profiles")

locations = [
  %{address: "Bulawayo, Zimbabwe", lat: -20.1457, lon: 28.5873},
  %{address: "Harare, Zimbabwe", lat: -17.8292, lon: 31.0522},
  %{address: "Gweru, Zimbabwe", lat: -19.4500, lon: 29.8167},
  %{address: "Victoria Falls, Zimbabwe", lat: -17.9243, lon: 25.8560},
  %{address: "Soweto, Johannesburg, Gauteng, South Africa", lat: -26.2678, lon: 27.8585},
  %{address: "Sandton, Johannesburg, Gauteng, South Africa", lat: -26.1076, lon: 28.0567},
  %{address: "Pretoria, Gauteng, South Africa", lat: -25.7461, lon: 28.1881},
  %{address: "Durban, KwaZulu-Natal, South Africa", lat: -29.8587, lon: 31.0218},
  %{address: "Cape Town, Western Cape, South Africa", lat: -33.9249, lon: 18.4241},
  %{address: "Port Elizabeth, Eastern Cape, South Africa", lat: -33.9608, lon: 25.6022},
  %{address: "Bloemfontein, Free State, South Africa", lat: -29.0852, lon: 26.1596},
  %{address: "Polokwane, Limpopo, South Africa", lat: -23.9045, lon: 29.4689},
  %{address: "Mbombela, Mpumalanga, South Africa", lat: -25.4658, lon: 30.9853}
]

users =
  Enum.map(1..40, fn number ->
    role = if number < 21, do: "driver", else: "owner"

    params = %{
      first_name: Person.first_name(),
      last_name: Person.last_name(),
      username: "user#{number}",
      email: "user#{number}@gmail.com",
      password: "user123",
      location: Enum.random(locations),
      role: role
    }

    {:ok, user} =
      User.registration_changeset(params)
      |> Repo.insert()


    %Membership{
      user_id: user.id,
      role: role
    }

    asset_params = %{
      file: %Plug.Upload{
        path: Path.expand("priv/person-test.jpg"),
        filename: "uploads/person-test.jpg",
      },
      user_id: user.id
    }

    Assets.upload_and_save(asset_params)

    user
  end)

{drivers_users, owners_users} = Enum.split(users, 20)

#####################################################################################################

# Logger.info("Creating business profiles")

# business_profiles =
#   Enum.map(users, fn user ->
#     {:ok, profile} =
#       %BusinessProfile{
#         user_id: user.id,
#         active: true,
#         description: Company.catch_phrase(),
#         email: Internet.email(),
#         name: Company.name(),
#         location: %{
#           address: Address.street_address(),
#           lat: Address.latitude(),
#           lng: Address.longitude()
#         },
#         phone: Faker.Phone.EnUs.phone()
#       }
#       |> Repo.insert()

#     Logger.info("Creating business profiles user_id memberships")

#     %Membership{
#       user_id: user.id,
#       role: EctoEnums.RoleEnum.__enum_map__()[:owner]
#     }
#     |> Repo.insert()

#     # CREATE PROFILE ASSET
#     asset_params = %{
#       file: %Plug.Upload{
#         path: Path.expand("priv/person-test.jpg"),
#         filename: "uploads/person-test.jpg",
#       },
#       business_profile_id: profile.id
#     }

#     Assets.upload_and_save(asset_params)

#     profile
#   end)

######################################################################################################

Logger.info("Creating vehicles")

vehicle_brands = ["bmw", "nissan", "volkswagen", "audi", "toyota", "mercedes", "ford", "honda", "hyundai", "kia", "mazda", "subaru", "lexus", "volvo"]
vehicle_models = ["Civic", "Corolla", "Accord", "Camry", "Model S", "Mustang", "Golf", "A4", "CX-5", "Elantra", "Tucson", "X5", "C-Class", "E-Class", "Altima", "Forester"]
vehicle_types = ["bike", "passenger", "taxi", "truck", "lorry"]
fuel_types = [:diesel, :petrol, :electric, :hybrid, :hydrogen]
vehicle_images = 1..7 |> Enum.to_list() # car1.jpg ... car7.jpg

counter = :atomics.new(1, signed: true)
:atomics.put(counter, 1, 0) # initial value 0

vehicles =
  Enum.flat_map(owners_users, fn user ->
    rand_number = Enum.random(1..length(vehicle_types))

    vehicles =
      Enum.map(1..3, fn v ->
        {:ok, vehicle} =
          %Vehicle{
            type: Enum.random(vehicle_types),
            brand: Enum.random(vehicle_brands),
            model: Enum.random(vehicle_models),
            manual: Enum.random([true, false]),
            fuel_type: Enum.random(fuel_types),
            model_year: Enum.random(2005..2024),
            engine_capacity: 1.2,
            passengers: Enum.random(2..40),
            description: "Has suspension problems",
            active: true,
            mileage: Enum.random(10000..100000),
            price_fixed: %{currency: "ZAR", value: Enum.random(20..60)},
            user_id: user.id,
          }
          |> Repo.insert()

          # CREATE VEHICLE ASSET
        count = :atomics.add_get(counter, 1, 1) # atomically increment
        image_index = rem(count - 1, length(vehicle_images)) + 1

        asset_params = %{
          file: %Plug.Upload{
            path: Path.expand("priv/vehicles/car#{image_index}.jpg"),
            filename: "uploads/car#{image_index}.jpg",
          },
          vehicle_id: vehicle.id
        }

      Assets.upload_and_save(asset_params)

      vehicle
    end)
  end)

######################################################################################################

Logger.info("Creating drivers")

driver_platforms = ["bike", "passenger", "taxi", "truck", "lorry", "uber", "bolt", "uber_eats", "checkers", "mr_d_food"]

descriptions = [
  "I drive trucks all over the city",
  "Experienced Uber driver",
  "Delivering food quickly and safely",
  "Car and motorbike driver available",
  "Professional bus driver with 10+ years experience",
  "Licensed for trucks and cars",
  "Fast and reliable deliveries"
]

licences = ["class_1", "class_2", "class_3", "class_4", "class_5", "psv", "code_A1", "code_A", "code_B", "code_EB", "code_C1", "code_C", "code_EC1", "code_EC"]

random_platforms = fn platforms ->
  rand_num_of_items = Enum.random(1..length(platforms))

  platforms
  |> Enum.shuffle()
  |> Enum.take(rand_num_of_items)
end

random_licences = fn licences ->
  rand_num_of_items = Enum.random(1..length(licences))

  licences
  |> Enum.shuffle()
  |> Enum.take(rand_num_of_items)
end

drivers =
  Enum.map(drivers_users, fn user ->
    {:ok, driver} =
      %Driver{
        description: Enum.random(descriptions),
        licences: random_licences.(licences),
        active: true,
        experience: Enum.random(0..52),
        location: Enum.random(locations),
        dob: Date.new!(Enum.random(1960..2006), 10, 13),
        platforms: random_platforms.(driver_platforms),
        user_id: user.id,
      }
      |> Repo.insert()

      driver
    end)

######################################################################################################

# Logger.info("Creating posts")

# posts =
#   Enum.map(owners_users, fn user ->
#     profile = Enum.find(business_profiles, fn bp -> bp.user_id == user.id end)

#       {:ok, post} =
#         %Post{
#           location: %{"lat" => 0.0, "lng" => 0.0},
#           description: "I am looking for a scooter driver",
#           licences: ["General", "Class 2", "Class 4"],
#           location_options: ["Pretoria", "Jozi", "Soweto"],
#           business_profile_id: profile.id,
#         }
#         |> Repo.insert()

#       # CREATE POST ASSET
#       asset_params = %{
#         file: %Plug.Upload{
#           path: Path.expand("priv/car-test.jpg"),
#           filename: "uploads/car-test.jpg",
#         },
#         vehicle_id: vehicle.id
#       }

#       Assets.upload_and_save(asset_params)

#       post
#     end)

######################################################################################################

Logger.info("Creating vehicle_applications")

vehicle_applications =
  Enum.flat_map(vehicles, fn vehicle ->
    Enum.map(Enum.zip(drivers, 1..20), fn {driver, index} ->
      seen = if index < 11, do: false, else: true

      inserted_at =
        NaiveDateTime.utc_now()
        |> Timex.shift(minutes: -(index * 170))
        |> NaiveDateTime.truncate(:second)

      {:ok, vehicle_application} =
        %VehicleApplication{
          driver_id: driver.id,
          vehicle_id: vehicle.id,
          seen: seen
        }
        |> Repo.insert()

      vehicle_application
    end)
  end)

######################################################################################################

# Logger.info("Creating driver_bookings")

# driver_bookings =
#   Enum.map(Enum.zip(owners_users, drivers), fn {user, driver} ->
#       {:ok, driver_booking} =
#         %DriverBooking{
#           # booked_date: ,
#           note: "can you drive this truck?",
#           price_fixed: %{currency: "dollars", value: 25},
#           user_id: user.id,
#           driver_id: driver.id,
#         }
#         |> Repo.insert()

#       driver_booking
#     end)

######################################################################################################

Logger.info("Creating vehicle_drivers")

vehicle_drivers =
  Enum.map(Enum.zip(Enum.take(drivers, 10), Enum.take(vehicles, 10)), fn {driver, vehicle} ->
      {:ok, vehicle_driver} =
        %VehicleDriver{
          accidents: Enum.random(1..3),
          vehicle_id: vehicle.id,
          driver_id: driver.id,
          active: true,
        }
        |> Repo.insert()

      vehicle_driver
    end)

######################################################################################################

Logger.info("Creating payments")

payments =
  Enum.flat_map(Enum.zip(vehicle_drivers, 1..10), fn {vehicle_driver, price} ->
    Enum.map(1..20, fn v ->
      inserted_at =
        NaiveDateTime.utc_now()
        |> Timex.shift(minutes: -(v * 1300))
        |> NaiveDateTime.truncate(:second)

      {:ok, payment} =
        %Payment{
          price_fixed: %{currency: "dollars", value: price * v},
          vehicle_driver_id: vehicle_driver.id,
          inserted_at: inserted_at
        }
        |> Repo.insert()

      payment
    end)
  end)
######################################################################################################

Logger.info("Creating driver reviews")

driver_reviews =
  Enum.flat_map(drivers, fn driver ->
    Enum.map(owners_users, fn owner ->
      {:ok, review} =
        %Review{
          author_id: owner.id,
          driver_id: driver.id,
          rating: (:rand.uniform(39) + 10) / 10
        }
        |> Repo.insert()

        review
    end)
  end)

######################################################################################################

Logger.info("Creating driver comments")

driver_comments =
  Enum.flat_map(drivers, fn driver ->
    Enum.map(owners_users, fn owner ->
      {:ok, comment} =
        %Comment{
          text: "#{driver.id} is not a good driver",
          author_id: owner.id,
          driver_id: driver.id,
        }
        |> Repo.insert()

        comment
    end)
  end)

######################################################################################################

# Logger.info("Creating reviews replys")

# [_first, second, third | rest] = owners_users

# comments_replys =
#   Enum.flat_map(driver_comments, fn comment ->
#     Enum.map([second, third], fn owner ->
#       {:ok, reply} =
#         %Reply{
#           text: "What did he do?",
#           author_id: owner.id,
#           comment_id: comment.id,
#         }
#         |> Repo.insert()

#         reply
#     end)
#   end)

######################################################################################################

Logger.info("Creating threads")

threads =
  Enum.map(owners_users, fn user ->
    {:ok, thread} = Threads.initialize_thread(user.id, List.first(drivers_users).id)

    thread
  end)

######################################################################################################

Logger.info("Creating messages")

preloads = [:messages, [thread_participants: :participant]]

messages =
  Enum.flat_map(Enum.zip(threads, owners_users), fn {thread, owner_user} ->
    thd_index =
      Enum.find_index(threads, fn thd ->
        thd.id == thread.id
      end)

    Enum.map(1..5, fn msg_number ->
      shift_minutes_by = ((thd_index + 1) * 10) + msg_number

      inserted_at =
        NaiveDateTime.utc_now()
        |> Timex.shift(minutes: -shift_minutes_by)
        |> NaiveDateTime.truncate(:second)

      {:ok, message} =
        %Message{
          content: "Message #{msg_number} in thread #{thread.id}",
          thread_id: thread.id,
          recipient_id: List.first(drivers_users).id,
          author_id: owner_user.id,
          inserted_at: inserted_at
        }
        |> Repo.insert()

      message
    end)
  end)

Logger.info("Seed data population completed successfully!")
# Logger.info("Created: #{length(users)} users, #{length(business_profiles)} business profiles")
Logger.info("Created: #{length(vehicle_applications)} vehicle_applications")
# Logger.info("Created: #{length(driver_bookings)} driver_bookings")
# Logger.info("Created: #{length(posts)} posts")
Logger.info("Created: #{length(vehicles)} vehicles")
Logger.info("Created: #{length(drivers)} drivers")
Logger.info("Created: #{length(vehicle_drivers)} vehicle_drivers")
Logger.info("Created: #{length(payments)} payments")
Logger.info("Created: #{length(driver_comments)} driver_comments")
Logger.info("Created: #{length(threads)} threads, #{length(messages)} messages")
