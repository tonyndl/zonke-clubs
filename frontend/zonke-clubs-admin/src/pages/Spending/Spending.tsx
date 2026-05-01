import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "../../components/Card";
import { PrimaryButton, OutlineButton } from "../../components/Buttons";
import { theme } from "../../styles/theme";
import {
  AddSpendingRecordModal,
  SpendingRecordFormData,
  GroupMember,
} from "../../components/Modal";
import { apiService } from "../../services/api";
import {
  RiWallet3Line,
  RiUserLine,
  RiFileTextLine,
  RiAddLine,
  RiArrowUpLine,
} from "react-icons/ri";
import { HiSparkles } from "react-icons/hi2";
import { HiArrowUp, HiArrowDown, HiMinus, HiTrophy } from "react-icons/hi2";
import {
  SpendingContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  HeaderActions,
  StatsRow,
  StatCard,
  StatHeader,
  StatIcon,
  StatValue,
  StatLabel,
  TableCard,
  TableHeader,
  FilterSection,
  FilterGroup,
  FilterLabel,
  FilterTabs,
  FilterTab,
  RecordsList,
  RecordCard,
  UserSection,
  UserAvatar,
  UserInfo,
  Username,
  UserId,
  RankBadge,
  NightSpendSection,
  NightLabel,
  NightAmount,
  NightDate,
  NightTag,
  StatsGrid,
  MiniStat,
  MiniStatLabel,
  MiniStatValue,
  RankPosition,
  EmptyState,
} from "./styles";

export const Spending: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableGroupMode, setEnableGroupMode] = useState(false);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod]);

  const fetchLeaderboard = () => {
    setIsLoading(true);
    apiService
      .getLeaderboard(timePeriod, 10)
      .then((response) => {
        setLeaderboard(response.leaderboard || []);
      })
      .catch((error) => {
        console.error("Error fetching leaderboard:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddRecord = (formData: SpendingRecordFormData) => {
    if (
      formData.isGroup &&
      formData.groupMembers &&
      formData.groupMembers.length > 0
    ) {
      // Create group spending records - all members are now in groupMembers array
      const records = formData.groupMembers.map((member) => ({
        user_id: member.customerId,
        amount: member.splitAmount,
        visit_date: formData.visitDate,
        notes: formData.notes || "",
      }));

      apiService
        .createGroupSpending(records)
        .then(() => {
          fetchLeaderboard();
        })
        .catch((error) => {
          console.error("Error creating group spending:", error);
          alert("Failed to create spending records. Please try again.");
        });
    } else {
      // Single spending record
      const record = {
        user_id: formData.customerId,
        amount: parseFloat(formData.amount),
        visit_date: formData.visitDate,
        notes: formData.notes || "",
      };

      apiService
        .createSpendingRecord(record)
        .then(() => {
          fetchLeaderboard();
        })
        .catch((error) => {
          console.error("Error creating spending record:", error);
          alert("Failed to create spending record. Please try again.");
        });
    }

    setEnableGroupMode(false);
  };

  const formatCurrency = (amount: number) => {
    const fixed = amount.toFixed(2);
    const [integer, decimal] = fixed.split(".");
    const spacedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `R${spacedInteger}.${decimal}`;
  };

  // Add ranking information to leaderboard
  const rankedRecords = leaderboard.map((entry, index) => {
    const fullName = entry.username ? entry.username : entry.username;

    return {
      id: entry.user_id,
      user_id: entry.user_id,
      username: fullName,
      user_avatar: entry.avatar_url || "https://i.pravatar.cc/150?img=0",
      amount: parseFloat(entry.amount),
      visit_date: entry.visit_date,
      rank: entry.rank || index + 1, // Use backend rank (handles ties), fallback to index
      positionChange:
        entry.position_change !== undefined ? entry.position_change : 0,
      timeOnChart: entry.time_on_chart || 1,
      timeUnit: entry.time_unit || "weeks",
    };
  });

  return (
    <SpendingContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Best Nights Leaderboard</PageTitle>
          <PageDescription>
            Track the biggest spenders and their best single-night performances
            at the club.
          </PageDescription>
        </HeaderLeft>
        <HeaderActions>
          <PrimaryButton
            onClick={() => {
              setEnableGroupMode(false);
              setIsModalOpen(true);
            }}
          >
            {React.createElement(RiAddLine as React.ComponentType)}
            Add Record
          </PrimaryButton>
        </HeaderActions>
      </PageHeader>

      <AddSpendingRecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEnableGroupMode(false);
        }}
        onSubmit={handleAddRecord}
        initialGroupMode={enableGroupMode}
      />

      {/*       <QuickBottleServiceModal
                isOpen={isBottleServiceModalOpen}
                onClose={() => setIsBottleServiceModalOpen(false)}
                onSubmit={handleAddBottleService}
      />
      */}

      {/* <StatsRow>
        <StatCard>
          <StatHeader>
            <StatIcon>
              {React.createElement(RiWallet3Line as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(totalSpending)}</StatValue>
          <StatLabel>Total Captured</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon>
              {React.createElement(RiUserLine as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(averageSpending)}</StatValue>
          <StatLabel>Average Night</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon>
              {React.createElement(RiArrowUpLine as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>{topSpender ? formatCurrency(topSpender.amount) : 'N/A'}</StatValue>
          <StatLabel>Best Single Night</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon>
              {React.createElement(RiFileTextLine as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>{records.length}</StatValue>
          <StatLabel>Epic Nights Logged</StatLabel>
        </StatCard>
      </StatsRow> */}

      <TableCard>
        <TableHeader>
          <CardTitle>🏆 Top 10 Leaderboard</CardTitle>
          <CardDescription>
            The top 10 biggest spenders ranked by their best single-night
            performance
          </CardDescription>
        </TableHeader>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>Time Period</FilterLabel>
            <FilterTabs>
              <FilterTab
                active={timePeriod === "week"}
                onClick={() => setTimePeriod("week")}
              >
                This Week
              </FilterTab>
              <FilterTab
                active={timePeriod === "month"}
                onClick={() => setTimePeriod("month")}
              >
                This Month
              </FilterTab>
              <FilterTab
                active={timePeriod === "all"}
                onClick={() => setTimePeriod("all")}
              >
                All Time
              </FilterTab>
            </FilterTabs>
          </FilterGroup>
        </FilterSection>

        {!isLoading && rankedRecords.length > 0 ? (
          <RecordsList>
            {rankedRecords.map((record) => {
              const isVIP = record.amount >= 5000;
              const isTopSpender = record.rank === 1;

              return (
                <RecordCard key={record.id} rank={record.rank}>
                  <RankBadge rank={record.rank}>
                    {record.rank === 1
                      ? React.createElement(HiTrophy as React.ComponentType)
                      : record.rank}
                  </RankBadge>

                  <UserSection>
                    <UserAvatar
                      src={record.user_avatar}
                      alt={record.username}
                      rank={record.rank}
                    />
                    <UserInfo>
                      <Username>{record.username}</Username>
                    </UserInfo>
                  </UserSection>

                  <NightAmount isTop={isTopSpender}>
                    {formatCurrency(record.amount)}
                  </NightAmount>

                  <NightDate>
                    {(() => {
                      const [year, month, day] = record.visit_date
                        .split("-")
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    })()}
                  </NightDate>

                  <MiniStatValue highlight>
                    {record.timeUnit === "new" ? (
                      <>⭐ New</>
                    ) : (
                      <>
                        {record.timeOnChart}{" "}
                        {record.timeOnChart === 1
                          ? record.timeUnit?.slice(0, -1)
                          : record.timeUnit}
                      </>
                    )}
                  </MiniStatValue>
                </RecordCard>
              );
            })}
          </RecordsList>
        ) : isLoading ? (
          <EmptyState>
            <CardDescription>Loading leaderboard...</CardDescription>
          </EmptyState>
        ) : (
          <EmptyState>
            {React.createElement(RiWallet3Line as React.ComponentType)}
            <CardTitle>No epic nights recorded yet</CardTitle>
            <CardDescription>
              Start logging the biggest nights to see who dominates the
              leaderboard
            </CardDescription>
            <PrimaryButton
              style={{ marginTop: theme.spacing.lg }}
              onClick={() => setIsModalOpen(true)}
            >
              {/* {React.createElement(RiAddLine as React.ComponentType)} */}
              Log First Night
            </PrimaryButton>
          </EmptyState>
        )}
      </TableCard>
    </SpendingContainer>
  );
};
