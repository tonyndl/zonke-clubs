defmodule Backend.DJsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.DJs

  # ── DJ CRUD ──────────────────────────────────────────────────────────────────

  describe "list_djs/1" do
    test "returns all DJs for a club ordered by name" do
      club = insert(:club)
      insert(:dj, name: "Zara", club: club)
      insert(:dj, name: "Alpha", club: club)
      insert(:dj, name: "Mike", club: club)

      djs = DJs.list_djs(club.id)
      assert length(djs) == 3
      assert Enum.map(djs, & &1.name) == ["Alpha", "Mike", "Zara"]
    end

    test "does not return DJs from another club" do
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:dj, club: club1)
      insert(:dj, club: club2)

      djs = DJs.list_djs(club1.id)
      assert length(djs) == 1
    end

    test "returns empty list when club has no DJs" do
      club = insert(:club)
      assert DJs.list_djs(club.id) == []
    end
  end

  describe "get_dj/2" do
    test "returns DJ when found in club" do
      dj = insert(:dj)
      assert {:ok, found} = DJs.get_dj(dj.id, dj.club_id)
      assert found.id == dj.id
    end

    test "returns error when DJ belongs to different club" do
      dj = insert(:dj)
      other_club = insert(:club)
      assert {:error, :not_found} = DJs.get_dj(dj.id, other_club.id)
    end

    test "returns error for non-existent ID" do
      club = insert(:club)
      assert {:error, :not_found} = DJs.get_dj(Ecto.UUID.generate(), club.id)
    end
  end

  describe "create_dj/2" do
    test "creates a DJ with required fields" do
      club = insert(:club)
      attrs = %{"name" => "DJ Fresh"}

      assert {:ok, dj} = DJs.create_dj(attrs, club.id)
      assert dj.name == "DJ Fresh"
      assert dj.club_id == club.id
    end

    test "creates a DJ with all optional fields" do
      club = insert(:club)
      attrs = %{
        "name" => "DJ Tech",
        "genre" => "Techno",
        "bio" => "Cape Town's finest",
        "instagram" => "@djtech",
        "tiktok" => "@djtech_tt",
        "soundcloud" => "soundcloud.com/djtech"
      }

      assert {:ok, dj} = DJs.create_dj(attrs, club.id)
      assert dj.genre == "Techno"
      assert dj.bio == "Cape Town's finest"
      assert dj.instagram == "@djtech"
    end

    test "returns error when name is missing" do
      club = insert(:club)
      assert {:error, changeset} = DJs.create_dj(%{}, club.id)
      assert "can't be blank" in errors_on(changeset).name
    end

    test "returns error when name exceeds 255 characters" do
      club = insert(:club)
      attrs = %{"name" => String.duplicate("a", 256)}
      assert {:error, changeset} = DJs.create_dj(attrs, club.id)
      assert "should be at most 255 character(s)" in errors_on(changeset).name
    end

    test "returns error when bio exceeds 1000 characters" do
      club = insert(:club)
      attrs = %{"name" => "DJ Valid", "bio" => String.duplicate("x", 1001)}
      assert {:error, changeset} = DJs.create_dj(attrs, club.id)
      assert "should be at most 1000 character(s)" in errors_on(changeset).bio
    end
  end

  describe "update_dj/2" do
    test "updates DJ attributes" do
      dj = insert(:dj, name: "Old Name")
      assert {:ok, updated} = DJs.update_dj(dj, %{"name" => "New Name", "genre" => "House"})
      assert updated.name == "New Name"
      assert updated.genre == "House"
    end

    test "returns error for invalid attributes" do
      dj = insert(:dj)
      assert {:error, changeset} = DJs.update_dj(dj, %{"name" => ""})
      assert "can't be blank" in errors_on(changeset).name
    end
  end

  describe "delete_dj/1" do
    test "deletes the DJ" do
      dj = insert(:dj)
      assert {:ok, _} = DJs.delete_dj(dj)
      assert {:error, :not_found} = DJs.get_dj(dj.id, dj.club_id)
    end
  end

  # ── DJ SCHEDULE CRUD ─────────────────────────────────────────────────────────

  describe "list_schedules/1" do
    test "returns all schedules for a club" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      insert(:dj_schedule, club: club, dj: dj, day_of_week: 5)
      insert(:dj_schedule, club: club, dj: dj, day_of_week: 6)

      schedules = DJs.list_schedules(club.id)
      assert length(schedules) == 2
    end

    test "orders schedules by day then start time" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      insert(:dj_schedule, club: club, dj: dj, day_of_week: 6, start_time: ~T[22:00:00])
      insert(:dj_schedule, club: club, dj: dj, day_of_week: 5, start_time: ~T[23:00:00])
      insert(:dj_schedule, club: club, dj: dj, day_of_week: 5, start_time: ~T[20:00:00])

      schedules = DJs.list_schedules(club.id)
      days = Enum.map(schedules, & &1.day_of_week)
      assert days == [5, 5, 6]
    end

    test "does not return schedules from another club" do
      club1 = insert(:club)
      club2 = insert(:club)
      dj1 = insert(:dj, club: club1)
      dj2 = insert(:dj, club: club2)
      insert(:dj_schedule, club: club1, dj: dj1)
      insert(:dj_schedule, club: club2, dj: dj2)

      assert length(DJs.list_schedules(club1.id)) == 1
    end
  end

  describe "list_schedules_for_week/2" do
    test "returns weekly recurring schedules" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      insert(:dj_schedule, club: club, dj: dj, type: "weekly", day_of_week: 5)

      week_start = Date.utc_today() |> Date.beginning_of_week(:sunday)
      schedules = DJs.list_schedules_for_week(club.id, week_start)
      assert length(schedules) == 1
    end

    test "returns specific-date schedules within the week" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      week_start = Date.utc_today() |> Date.beginning_of_week(:sunday)
      in_week = Date.add(week_start, 3)
      out_of_week = Date.add(week_start, 10)

      insert(:dj_schedule, club: club, dj: dj, type: "specific", specific_date: in_week, day_of_week: nil)
      insert(:dj_schedule, club: club, dj: dj, type: "specific", specific_date: out_of_week, day_of_week: nil)

      schedules = DJs.list_schedules_for_week(club.id, week_start)
      assert length(schedules) == 1
      assert hd(schedules).specific_date == in_week
    end

    test "returns empty list when no schedules exist" do
      club = insert(:club)
      week_start = Date.utc_today() |> Date.beginning_of_week(:sunday)
      assert DJs.list_schedules_for_week(club.id, week_start) == []
    end
  end

  describe "get_schedule/2" do
    test "returns schedule with preloaded DJ" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      schedule = insert(:dj_schedule, club: club, dj: dj)

      assert {:ok, found} = DJs.get_schedule(schedule.id, club.id)
      assert found.id == schedule.id
      assert found.dj.id == dj.id
    end

    test "returns error when schedule belongs to different club" do
      club = insert(:club)
      other_club = insert(:club)
      dj = insert(:dj, club: club)
      schedule = insert(:dj_schedule, club: club, dj: dj)

      assert {:error, :not_found} = DJs.get_schedule(schedule.id, other_club.id)
    end
  end

  describe "create_schedule/2" do
    test "creates a weekly schedule" do
      club = insert(:club)
      dj = insert(:dj, club: club)

      attrs = %{
        "dj_id" => dj.id,
        "type" => "weekly",
        "day_of_week" => 5,
        "start_time" => "22:00:00",
        "end_time" => "03:00:00"
      }

      assert {:ok, schedule} = DJs.create_schedule(attrs, club.id)
      assert schedule.type == "weekly"
      assert schedule.day_of_week == 5
      assert schedule.dj.id == dj.id
    end

    test "creates a specific-date schedule" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      specific_date = Date.add(Date.utc_today(), 7)

      attrs = %{
        "dj_id" => dj.id,
        "type" => "specific",
        "specific_date" => specific_date
      }

      assert {:ok, schedule} = DJs.create_schedule(attrs, club.id)
      assert schedule.type == "specific"
      assert schedule.specific_date == specific_date
    end

    test "requires day_of_week for weekly schedule" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      attrs = %{"dj_id" => dj.id, "type" => "weekly"}

      assert {:error, changeset} = DJs.create_schedule(attrs, club.id)
      assert "can't be blank" in errors_on(changeset).day_of_week
    end

    test "requires specific_date for specific schedule" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      attrs = %{"dj_id" => dj.id, "type" => "specific"}

      assert {:error, changeset} = DJs.create_schedule(attrs, club.id)
      assert "can't be blank" in errors_on(changeset).specific_date
    end

    test "rejects invalid type" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      attrs = %{"dj_id" => dj.id, "type" => "monthly"}

      assert {:error, changeset} = DJs.create_schedule(attrs, club.id)
      assert "is invalid" in errors_on(changeset).type
    end
  end

  describe "update_schedule/2" do
    test "updates schedule fields" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      schedule = insert(:dj_schedule, club: club, dj: dj, day_of_week: 4)

      assert {:ok, updated} = DJs.update_schedule(schedule, %{"day_of_week" => 6})
      assert updated.day_of_week == 6
    end
  end

  describe "delete_schedule/1" do
    test "deletes a schedule" do
      club = insert(:club)
      dj = insert(:dj, club: club)
      schedule = insert(:dj_schedule, club: club, dj: dj)

      assert {:ok, _} = DJs.delete_schedule(schedule)
      assert {:error, :not_found} = DJs.get_schedule(schedule.id, club.id)
    end
  end
end
