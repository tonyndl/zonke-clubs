defmodule Backend.Admin.EventsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Admin.Events

  describe "create_event/2" do
    test "creates event with valid attributes" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:ok, event} = Events.create_event(attrs, admin)
      assert event.title == "Summer Beach Party"
      assert event.admin_id == admin.id
      assert event.status == "draft"
      assert Decimal.equal?(event.general_entry_price, Decimal.new("150.00"))
    end

    test "creates event with optional fields" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft",
        "dj_lineup" => ["DJ Shadow", "DJ Kicks"],
        "cover_image" => "https://example.com/event.jpg"
      }

      assert {:ok, event} = Events.create_event(attrs, admin)
      assert event.dj_lineup == ["DJ Shadow", "DJ Kicks"]
      assert event.cover_image == "https://example.com/event.jpg"
    end

    test "automatically assigns admin_id" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:ok, event} = Events.create_event(attrs, admin)
      assert event.admin_id == admin.id
    end

    test "validates required fields" do
      admin = insert(:admin)

      assert {:error, changeset} = Events.create_event(%{}, admin)
      assert "can't be blank" in errors_on(changeset).title
      assert "can't be blank" in errors_on(changeset).description
      assert "can't be blank" in errors_on(changeset).date
      assert "can't be blank" in errors_on(changeset).start_time
      assert "can't be blank" in errors_on(changeset).end_time
      assert "can't be blank" in errors_on(changeset).general_entry_price
      assert "can't be blank" in errors_on(changeset).vip_entry_price
      # Note: status has a default value of "draft" so it won't be in validation errors
    end

    test "validates title length (min 3)" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "AB",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "should be at least 3 character(s)" in errors_on(changeset).title
    end

    test "validates title length (max 200)" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)
      long_title = String.duplicate("a", 201)

      attrs = %{
        "title" => long_title,
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "should be at most 200 character(s)" in errors_on(changeset).title
    end

    test "validates description length (min 10)" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Short",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "should be at least 10 character(s)" in errors_on(changeset).description
    end

    test "validates description length (max 2000)" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)
      long_description = String.duplicate("a", 2001)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => long_description,
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "should be at most 2000 character(s)" in errors_on(changeset).description
    end

    test "validates status is valid value" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "invalid_status"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "is invalid" in errors_on(changeset).status
    end

    test "validates general_entry_price is non-negative" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => -10.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "must be greater than or equal to 0" in errors_on(changeset).general_entry_price
    end

    test "validates vip_entry_price is non-negative" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => -50.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "must be greater than or equal to 0" in errors_on(changeset).vip_entry_price
    end

    test "validates date is not in the past" do
      admin = insert(:admin)
      past_date = Date.utc_today() |> Date.add(-7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => past_date,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "cannot be in the past" in errors_on(changeset).date
    end

    test "allows today's date" do
      admin = insert(:admin)
      today = Date.utc_today()

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => today,
        "start_time" => "22:00",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:ok, event} = Events.create_event(attrs, admin)
      assert event.date == today
    end

    test "validates start_time format" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "invalid_time",
        "end_time" => "04:00",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "must be in HH:MM format" in errors_on(changeset).start_time
    end

    test "validates end_time format" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "22:00",
        "end_time" => "25:99",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:error, changeset} = Events.create_event(attrs, admin)
      assert "must be in HH:MM format" in errors_on(changeset).end_time
    end

    test "accepts valid time formats" do
      admin = insert(:admin)
      future_date = Date.utc_today() |> Date.add(7)

      attrs = %{
        "title" => "Summer Beach Party",
        "description" => "Join us for the hottest party of the season!",
        "date" => future_date,
        "start_time" => "00:00",
        "end_time" => "23:59",
        "general_entry_price" => 150.00,
        "vip_entry_price" => 300.00,
        "status" => "draft"
      }

      assert {:ok, event} = Events.create_event(attrs, admin)
      assert event.start_time == "00:00"
      assert event.end_time == "23:59"
    end
  end

  describe "list_events/1" do
    test "returns all events for admin ordered by date (most recent first)" do
      admin = insert(:admin)
      other_admin = insert(:admin)

      # Create events with different dates
      event1 = insert(:event, admin_id: admin.id, date: Date.utc_today() |> Date.add(1))
      event2 = insert(:event, admin_id: admin.id, date: Date.utc_today() |> Date.add(7))
      event3 = insert(:event, admin_id: admin.id, date: Date.utc_today() |> Date.add(3))
      _other_event = insert(:event, admin_id: other_admin.id)

      events = Events.list_events(admin)

      # Should only return admin's events, ordered by date desc
      assert length(events) == 3
      assert Enum.map(events, & &1.id) == [event2.id, event3.id, event1.id]
    end

    test "returns empty list when admin has no events" do
      admin = insert(:admin)

      assert Events.list_events(admin) == []
    end
  end

  describe "list_published_events/0" do
    test "returns only published events with future dates" do
      admin = insert(:admin)
      today = Date.utc_today()

      # Create various events
      published_future = insert(:event, admin_id: admin.id, date: today |> Date.add(7), status: "published")
      _draft_future = insert(:event, admin_id: admin.id, date: today |> Date.add(5), status: "draft")
      _published_past = insert(:event, admin_id: admin.id, date: today |> Date.add(-7), status: "published")

      events = Events.list_published_events()

      # Should only return published events with date >= today
      assert length(events) == 1
      assert hd(events).id == published_future.id
    end

    test "returns events ordered by date (upcoming first)" do
      admin = insert(:admin)
      today = Date.utc_today()

      event1 = insert(:event, admin_id: admin.id, date: today |> Date.add(7), status: "published")
      event2 = insert(:event, admin_id: admin.id, date: today |> Date.add(1), status: "published")
      event3 = insert(:event, admin_id: admin.id, date: today |> Date.add(3), status: "published")

      events = Events.list_published_events()

      # Should be ordered by date asc (soonest first)
      assert Enum.map(events, & &1.id) == [event2.id, event3.id, event1.id]
    end

    test "includes today's published events" do
      admin = insert(:admin)
      today = Date.utc_today()

      today_event = insert(:event, admin_id: admin.id, date: today, status: "published")

      events = Events.list_published_events()

      assert length(events) == 1
      assert hd(events).id == today_event.id
    end

    test "returns empty list when no published future events" do
      assert Events.list_published_events() == []
    end
  end

  describe "get_event/2" do
    test "returns event when found by id and belongs to admin" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id)

      assert {:ok, found} = Events.get_event(event.id, admin)
      assert found.id == event.id
      assert found.title == event.title
    end

    test "returns error when event not found" do
      admin = insert(:admin)

      assert {:error, :not_found} = Events.get_event(Ecto.UUID.generate(), admin)
    end

    test "returns error when event belongs to different admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      event = insert(:event, admin_id: other_admin.id)

      assert {:error, :not_found} = Events.get_event(event.id, admin)
    end
  end

  describe "get_published_event/1" do
    test "returns published event when found" do
      event = insert(:event, status: "published")

      assert {:ok, found} = Events.get_published_event(event.id)
      assert found.id == event.id
    end

    test "returns error when event is draft" do
      event = insert(:event, status: "draft")

      assert {:error, :not_found} = Events.get_published_event(event.id)
    end

    test "returns error when event not found" do
      assert {:error, :not_found} = Events.get_published_event(Ecto.UUID.generate())
    end
  end

  describe "update_event/3" do
    test "updates event successfully when it belongs to admin" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id, title: "Old Title")

      assert {:ok, updated} = Events.update_event(event.id, %{"title" => "New Title"}, admin)
      assert updated.title == "New Title"
    end

    test "validates on update" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id)

      assert {:error, changeset} = Events.update_event(event.id, %{"title" => "AB"}, admin)
      assert "should be at least 3 character(s)" in errors_on(changeset).title
    end

    test "returns error when event belongs to different admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      event = insert(:event, admin_id: other_admin.id)

      assert {:error, :not_found} = Events.update_event(event.id, %{"title" => "New Title"}, admin)
    end

    test "returns error when event not found" do
      admin = insert(:admin)

      assert {:error, :not_found} =
               Events.update_event(Ecto.UUID.generate(), %{"title" => "New Title"}, admin)
    end
  end

  describe "delete_event/2" do
    test "deletes event when it belongs to admin" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id)

      assert {:ok, deleted} = Events.delete_event(event.id, admin)
      assert deleted.id == event.id
      assert {:error, :not_found} = Events.get_event(event.id, admin)
    end

    test "returns error when event belongs to different admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      event = insert(:event, admin_id: other_admin.id)

      assert {:error, :not_found} = Events.delete_event(event.id, admin)
    end

    test "returns error when event not found" do
      admin = insert(:admin)

      assert {:error, :not_found} = Events.delete_event(Ecto.UUID.generate(), admin)
    end
  end

  describe "publish_event/2" do
    test "changes status from draft to published" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id, status: "draft")

      assert {:ok, published} = Events.publish_event(event.id, admin)
      assert published.status == "published"
    end

    test "returns error when event belongs to different admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      event = insert(:event, admin_id: other_admin.id)

      assert {:error, :not_found} = Events.publish_event(event.id, admin)
    end
  end

  describe "unpublish_event/2" do
    test "changes status from published to draft" do
      admin = insert(:admin)
      event = insert(:event, admin_id: admin.id, status: "published")

      assert {:ok, unpublished} = Events.unpublish_event(event.id, admin)
      assert unpublished.status == "draft"
    end

    test "returns error when event belongs to different admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      event = insert(:event, admin_id: other_admin.id, status: "published")

      assert {:error, :not_found} = Events.unpublish_event(event.id, admin)
    end
  end

  describe "count_upcoming_events/1" do
    test "counts only published future events for admin" do
      admin = insert(:admin)
      other_admin = insert(:admin)
      today = Date.utc_today()

      # Admin's events
      insert(:event, admin_id: admin.id, date: today |> Date.add(1), status: "published")
      insert(:event, admin_id: admin.id, date: today |> Date.add(7), status: "published")
      insert(:event, admin_id: admin.id, date: today |> Date.add(3), status: "draft")
      insert(:event, admin_id: admin.id, date: today |> Date.add(-7), status: "published")

      # Other admin's event
      insert(:event, admin_id: other_admin.id, date: today |> Date.add(1), status: "published")

      assert Events.count_upcoming_events(admin) == 2
    end

    test "includes today's published events in count" do
      admin = insert(:admin)
      today = Date.utc_today()

      insert(:event, admin_id: admin.id, date: today, status: "published")
      insert(:event, admin_id: admin.id, date: today |> Date.add(1), status: "published")

      assert Events.count_upcoming_events(admin) == 2
    end

    test "returns 0 when admin has no upcoming published events" do
      admin = insert(:admin)

      assert Events.count_upcoming_events(admin) == 0
    end
  end

  describe "list_club_events/1" do
    test "returns published future events for admin-owned club" do
      admin = insert(:admin)
      club = insert(:club, user_id: nil, admin_id: admin.id)
      today = Date.utc_today()

      event1 = insert(:event, admin_id: admin.id, date: today |> Date.add(1), status: "published")
      event2 = insert(:event, admin_id: admin.id, date: today |> Date.add(7), status: "published")
      _draft = insert(:event, admin_id: admin.id, date: today |> Date.add(3), status: "draft")
      _past = insert(:event, admin_id: admin.id, date: today |> Date.add(-1), status: "published")

      events = Events.list_club_events(club.id)

      assert length(events) == 2
      # Ordered by date asc
      assert Enum.map(events, & &1.id) == [event1.id, event2.id]
    end

    test "returns empty list for user-owned club (no admin)" do
      club = insert(:club)

      assert Events.list_club_events(club.id) == []
    end

    test "returns empty list when club not found" do
      assert Events.list_club_events(Ecto.UUID.generate()) == []
    end

    test "orders events by date and start_time" do
      admin = insert(:admin)
      club = insert(:club, user_id: nil, admin_id: admin.id)
      today = Date.utc_today()
      future_date = today |> Date.add(5)

      # Same date, different times
      event1 =
        insert(:event, admin_id: admin.id, date: future_date, start_time: "23:00", status: "published")

      event2 =
        insert(:event, admin_id: admin.id, date: future_date, start_time: "21:00", status: "published")

      # Earlier date
      event3 = insert(:event, admin_id: admin.id, date: today |> Date.add(1), status: "published")

      events = Events.list_club_events(club.id)

      # Should be ordered by date asc, then start_time asc
      assert Enum.map(events, & &1.id) == [event3.id, event2.id, event1.id]
    end
  end
end
