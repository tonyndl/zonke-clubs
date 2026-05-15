defmodule Backend.Spending.SpendingRecordsTest do
  use Backend.DataCase, async: true

  import Backend.Factory
  alias Backend.Spending.SpendingRecords

  describe "create_spending_record/1" do
    test "creates a spending record with valid attributes" do
      user = insert(:user)
      club = insert(:club)

      attrs = %{
        "user_id" => user.id,
        "club_id" => club.id,
        "amount" => "500.00",
        "visit_date" => Date.utc_today()
      }

      assert {:ok, record} = SpendingRecords.create_spending_record(attrs)
      assert Decimal.equal?(record.amount, Decimal.new("500.00"))
      assert record.user_id == user.id
      assert record.club_id == club.id
    end

    test "returns error when required fields are missing" do
      assert {:error, changeset} = SpendingRecords.create_spending_record(%{})
      errors = errors_on(changeset)
      assert "can't be blank" in errors.user_id
      assert "can't be blank" in errors.club_id
      assert "can't be blank" in errors.amount
    end
  end

  describe "create_group_spending/1" do
    test "creates multiple records with the same group_outing_id" do
      user1 = insert(:user)
      user2 = insert(:user)
      club = insert(:club)
      today = Date.utc_today()

      attrs_list = [
        %{"user_id" => user1.id, "club_id" => club.id, "amount" => "250.00", "visit_date" => today},
        %{"user_id" => user2.id, "club_id" => club.id, "amount" => "250.00", "visit_date" => today}
      ]

      assert {:ok, records} = SpendingRecords.create_group_spending(attrs_list)
      assert length(records) == 2

      group_ids = Enum.map(records, & &1.group_outing_id) |> Enum.uniq()
      assert length(group_ids) == 1
      assert hd(group_ids) != nil
    end

    test "returns error when any record is invalid" do
      user = insert(:user)
      club = insert(:club)

      attrs_list = [
        %{"user_id" => user.id, "club_id" => club.id, "amount" => "250.00", "visit_date" => Date.utc_today()},
        %{"user_id" => user.id}
      ]

      assert {:error, _changeset} = SpendingRecords.create_group_spending(attrs_list)
    end
  end

  describe "list_spending_records/2" do
    test "returns all records for a club" do
      club = insert(:club)
      insert(:spending_record, club: club)
      insert(:spending_record, club: club)

      records = SpendingRecords.list_spending_records(club.id)
      assert length(records) == 2
    end

    test "respects limit option" do
      club = insert(:club)
      for _ <- 1..5, do: insert(:spending_record, club: club)

      records = SpendingRecords.list_spending_records(club.id, limit: 3)
      assert length(records) == 3
    end

    test "does not return records from other clubs" do
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:spending_record, club: club1)
      insert(:spending_record, club: club2)

      assert length(SpendingRecords.list_spending_records(club1.id)) == 1
    end

    test "preloads user data" do
      club = insert(:club)
      insert(:spending_record, club: club)

      [record] = SpendingRecords.list_spending_records(club.id)
      assert record.user != nil
    end
  end

  describe "get_leaderboard/2" do
    test "returns ranked users by best single visit amount" do
      club = insert(:club)
      user1 = insert(:user)
      user2 = insert(:user)

      insert(:spending_record, club: club, user: user1, amount: Decimal.new("1000.00"), visit_date: Date.utc_today())
      insert(:spending_record, club: club, user: user2, amount: Decimal.new("500.00"), visit_date: Date.utc_today())

      leaderboard = SpendingRecords.get_leaderboard(club.id)
      assert length(leaderboard) == 2
      assert hd(leaderboard).user_id == user1.id
      assert hd(leaderboard).rank == 1
    end

    test "each user appears only once with their best night" do
      club = insert(:club)
      user = insert(:user)

      insert(:spending_record, club: club, user: user, amount: Decimal.new("200.00"), visit_date: Date.add(Date.utc_today(), -2))
      insert(:spending_record, club: club, user: user, amount: Decimal.new("800.00"), visit_date: Date.utc_today())

      leaderboard = SpendingRecords.get_leaderboard(club.id)
      assert length(leaderboard) == 1
      assert Decimal.equal?(hd(leaderboard).amount, Decimal.new("800.00"))
    end

    test "handles tie in amounts with same rank" do
      club = insert(:club)
      user1 = insert(:user)
      user2 = insert(:user)

      insert(:spending_record, club: club, user: user1, amount: Decimal.new("500.00"), visit_date: Date.utc_today())
      insert(:spending_record, club: club, user: user2, amount: Decimal.new("500.00"), visit_date: Date.utc_today())

      leaderboard = SpendingRecords.get_leaderboard(club.id)
      ranks = Enum.map(leaderboard, & &1.rank)
      assert Enum.all?(ranks, &(&1 == 1))
    end

    test "returns empty list for club with no records" do
      club = insert(:club)
      assert SpendingRecords.get_leaderboard(club.id) == []
    end

    test "filters by week time period" do
      club = insert(:club)
      user1 = insert(:user)
      user2 = insert(:user)

      insert(:spending_record, club: club, user: user1, amount: Decimal.new("500.00"), visit_date: Date.utc_today())
      insert(:spending_record, club: club, user: user2, amount: Decimal.new("500.00"), visit_date: Date.add(Date.utc_today(), -30))

      leaderboard = SpendingRecords.get_leaderboard(club.id, time_period: :week)
      assert length(leaderboard) == 1
      assert hd(leaderboard).user_id == user1.id
    end
  end

  describe "get_club_stats/1" do
    test "returns aggregate stats for a club" do
      club = insert(:club)
      insert(:spending_record, club: club, amount: Decimal.new("300.00"))
      insert(:spending_record, club: club, amount: Decimal.new("700.00"))

      stats = SpendingRecords.get_club_stats(club.id)
      assert Decimal.equal?(stats.total_spending, Decimal.new("1000.00"))
      assert stats.total_records == 2
      assert Decimal.equal?(stats.max_spending, Decimal.new("700.00"))
    end

    test "returns zeros for club with no records" do
      club = insert(:club)
      stats = SpendingRecords.get_club_stats(club.id)
      assert stats.total_records == 0
    end
  end

  describe "get_user_spending_history/3" do
    test "returns records for user at a specific club" do
      user = insert(:user)
      club = insert(:club)
      insert(:spending_record, user: user, club: club)
      insert(:spending_record, user: user, club: club)

      history = SpendingRecords.get_user_spending_history(user.id, club.id)
      assert length(history) == 2
      assert Enum.all?(history, &(&1.user_id == user.id and &1.club_id == club.id))
    end

    test "respects limit option" do
      user = insert(:user)
      club = insert(:club)
      for _ <- 1..5, do: insert(:spending_record, user: user, club: club)

      history = SpendingRecords.get_user_spending_history(user.id, club.id, limit: 2)
      assert length(history) == 2
    end

    test "does not return records from other clubs" do
      user = insert(:user)
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:spending_record, user: user, club: club1)
      insert(:spending_record, user: user, club: club2)

      assert length(SpendingRecords.get_user_spending_history(user.id, club1.id)) == 1
    end
  end

  describe "get_user_spending_all_clubs/2" do
    test "returns all records for a user across clubs with club preloaded" do
      user = insert(:user)
      club1 = insert(:club)
      club2 = insert(:club)
      insert(:spending_record, user: user, club: club1)
      insert(:spending_record, user: user, club: club2)

      records = SpendingRecords.get_user_spending_all_clubs(user.id)
      assert length(records) == 2
      assert Enum.all?(records, &(not is_nil(&1.club)))
    end

    test "respects limit option" do
      user = insert(:user)
      for _ <- 1..5, do: insert(:spending_record, user: user, club: insert(:club))

      records = SpendingRecords.get_user_spending_all_clubs(user.id, limit: 2)
      assert length(records) == 2
    end
  end

  describe "get_user_stats/1" do
    test "returns aggregate stats for user across all clubs" do
      user = insert(:user)
      club = insert(:club)
      insert(:spending_record, user: user, club: club, amount: Decimal.new("300.00"))
      insert(:spending_record, user: user, club: club, amount: Decimal.new("700.00"))

      stats = SpendingRecords.get_user_stats(user.id)
      assert stats.total_visits == 2
      assert stats.most_visited_club != nil
      assert stats.most_visited_club.club_name == club.name
    end

    test "returns zeros for user with no records" do
      user = insert(:user)
      stats = SpendingRecords.get_user_stats(user.id)
      assert stats.total_visits == 0
      assert stats.most_visited_club == nil
    end
  end

  describe "get_user_club_stats/2" do
    test "returns stats for user at a specific club" do
      user = insert(:user)
      club = insert(:club)
      insert(:spending_record, user: user, club: club, amount: Decimal.new("200.00"))
      insert(:spending_record, user: user, club: club, amount: Decimal.new("400.00"))

      stats = SpendingRecords.get_user_club_stats(user.id, club.id)
      assert stats.total_visits == 2
      assert Decimal.equal?(stats.max_spending, Decimal.new("400.00"))
      assert Decimal.equal?(stats.min_spending, Decimal.new("200.00"))
    end

    test "returns zeros for user with no records at club" do
      user = insert(:user)
      club = insert(:club)
      stats = SpendingRecords.get_user_club_stats(user.id, club.id)
      assert stats.total_visits == 0
    end
  end

  describe "get_user_rankings/1" do
    test "returns user's rankings at clubs they appear in the top 10" do
      user = insert(:user)
      club = insert(:club)
      insert(:spending_record, user: user, club: club, amount: Decimal.new("1000.00"), visit_date: Date.utc_today())

      rankings = SpendingRecords.get_user_rankings(user.id)
      assert length(rankings) == 1
      assert hd(rankings).club_id == club.id
      assert hd(rankings).rank == 1
    end

    test "returns empty list for user with no records" do
      user = insert(:user)
      assert SpendingRecords.get_user_rankings(user.id) == []
    end
  end
end
