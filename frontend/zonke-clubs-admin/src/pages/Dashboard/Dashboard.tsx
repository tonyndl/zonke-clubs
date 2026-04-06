import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardTitle, CardDescription } from "../../components/Card";
import { PrimaryButton, OutlineButton } from "../../components/Buttons";
import { theme } from "../../styles/theme";
import { dashboardService } from "../../services/dashboardService";
import { spendingService } from "../../services/spendingService";
import { apiService } from "../../services/api";
import {
  HiUserGroup,
  HiCalendarDays,
  HiHeart,
  HiArrowTrendingUp,
  HiTrophy,
  HiArrowUp,
  HiArrowDown,
  HiMinus,
  HiSparkles,
  HiFire,
  HiBolt,
  HiClock,
  HiUsers,
  HiHashtag,
} from "react-icons/hi2";

import {
  DashboardContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  HeaderActions,
  HeroSection,
  HeroContent,
  HeroLeft,
  HeroTitle,
  HeroSubtitle,
  StatusBadge,
  HeroStats,
  HeroStatItem,
  HeroStatValue,
  HeroStatLabel,
  MainStatsGrid,
  ContentWrapper,
  StatCard,
  StatHeader,
  StatIcon,
  StatValue,
  StatLabel,
  StatChange,
  ActivityFeed,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityText,
  ActivityTime,
  QuickActionsGrid,
  QuickActionButton,
  PremiumCard,
  CardHeader,
  TableHeader,
  TableCard,
  RecordsList,
  SpendersList,
  SpenderItem,
  UserSection,
  RankBadge,
  UserAvatar,
  UserInfo,
  Username,
  NightSpendSection,
  NightLabel,
  NightAmount,
  NightDate,
  StatsGrid,
  MiniStat,
  MiniStatLabel,
  MiniStatValue,
  RankPosition,
  EmptyLeaderboard,
  EmptyLeaderboardIcon,
  EmptyLeaderboardTitle,
  EmptyLeaderboardSubtitle,
} from "./styles";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    Promise.all([
      dashboardService.getDashboardStats(),
      spendingService.getLeaderboard(),
      apiService.getDashboardStats(),
    ])
      .then(([dashStats, leaderboard, realStats]) => {
        console.log("📊 Dashboard Stats Response:", realStats);
        setStats(dashStats);
        setDashboardStats(realStats);
        setTopSpenders(leaderboard.slice(0, 5));
      })
      .catch((error) => {
        console.error("❌ Failed to load dashboard data:", error);
        console.error("Error details:", error.response?.data || error.message);
        // Set default stats on error
        setStats({
          new_favorites: 0,
          active_meetups: 0,
          upcoming_events: 0,
          avg_rating: 0,
          weekly_highlights: {
            trending_events: [],
            peak_nights: [],
          },
        });
        setDashboardStats({
          club_favorites: 0,
          upcoming_events: 0,
          total_posts: 0,
          pending_posts: 0,
        });
        setTopSpenders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number | string) => {
    const fixed = parseFloat(String(amount)).toFixed(2);
    const [integer, decimal] = fixed.split(".");
    const spacedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `R${spacedInteger}.${decimal}`;
  };

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: "favorite" as const,
      text: "Sarah Johnson added your club to favorites",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "event" as const,
      text: "Friday Night Fever event reached 156 RSVPs",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "bottle" as const,
      text: "New connection request from Michael Chen",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "booking" as const,
      text: 'John Smith RSVP\'d to "Summer Vibes" event',
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "favorite" as const,
      text: "12 new people favorited your club today",
      time: "3 hours ago",
    },
  ];

  // Removed club status and capacity tracking - not relevant for this dashboard

  return (
    <DashboardContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Welcome back! Here's what's happening at your club.
          </PageDescription>
        </HeaderLeft>
        <HeaderActions>
          <OutlineButton onClick={() => navigate("/spending")}>
            {React.createElement(HiTrophy as React.ComponentType)}
            View Leaderboard
          </OutlineButton>
          <PrimaryButton onClick={() => navigate("/events")}>
            {React.createElement(HiCalendarDays as React.ComponentType)}
            Manage Events
          </PrimaryButton>
        </HeaderActions>
      </PageHeader>

      {/* <HeroSection> */}
      {/* <HeroContent>
          <HeroLeft>
            <HeroTitle>
              {React.createElement(HiFire as React.ComponentType)}
              Tonight's Vibe
            </HeroTitle>
            <HeroSubtitle>The club is alive and the energy is electric!</HeroSubtitle>
            <StatusBadge status={clubStatus}>
              {React.createElement(HiBolt as React.ComponentType)}
              {clubStatus === 'open' ? 'CLUB IS OPEN' : 'CLUB IS CLOSED'}
            </StatusBadge>

            <HeroStats>
              <HeroStatItem>
                <HeroStatValue>{currentCapacity}/{maxCapacity}</HeroStatValue>
                <HeroStatLabel>Current Capacity</HeroStatLabel>
              </HeroStatItem>
              <HeroStatItem>
                <HeroStatValue>{capacityPercentage.toFixed(0)}%</HeroStatValue>
                <HeroStatLabel>Filled</HeroStatLabel>
              </HeroStatItem>
              <HeroStatItem>
                <HeroStatValue>🔥 High</HeroStatValue>
                <HeroStatLabel>Energy Level</HeroStatLabel>
              </HeroStatItem>
            </HeroStats>
          </HeroLeft>
        </HeroContent> */}
      {/* </HeroSection> */}

      <MainStatsGrid>
        <StatCard style={{ cursor: "default" }}>
          <StatHeader>
            <StatIcon>
              {React.createElement(HiHeart as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>
            {dashboardStats?.club_favorites?.toLocaleString() || 0}
          </StatValue>
          <StatLabel>Club Favorites</StatLabel>
        </StatCard>

        <StatCard onClick={() => navigate("/events")}>
          <StatHeader>
            <StatIcon>
              {React.createElement(HiCalendarDays as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>
            {dashboardStats?.upcoming_events?.toLocaleString() || 0}
          </StatValue>
          <StatLabel>Upcoming Events</StatLabel>
        </StatCard>

        <StatCard onClick={() => navigate("/content")}>
          <StatHeader>
            <StatIcon>
              {React.createElement(HiUserGroup as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>
            {dashboardStats?.total_posts?.toLocaleString() || 0}
          </StatValue>
          <StatLabel>Total Posts</StatLabel>
        </StatCard>

        <StatCard onClick={() => navigate("/content")}>
          <StatHeader>
            <StatIcon>
              {React.createElement(HiHashtag as React.ComponentType)}
            </StatIcon>
          </StatHeader>
          <StatValue>
            {dashboardStats?.pending_posts?.toLocaleString() || 0}
          </StatValue>
          <StatLabel>Pending Posts</StatLabel>
        </StatCard>
      </MainStatsGrid>

      {/* <ContentWrapper>
        <PremiumCard>
          <CardHeader>
            {React.createElement(HiClock as React.ComponentType)}
            <CardTitle style={{ marginBottom: 0 }}>Recent Activity</CardTitle>
          </CardHeader>
          <CardDescription>
            Latest updates and interactions with your club
          </CardDescription>

          <ActivityFeed>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon type={activity.type}>
                  {activity.type === 'favorite' && React.createElement(HiHeart as React.ComponentType)}
                  {activity.type === 'booking' && React.createElement(HiCalendarDays as React.ComponentType)}
                  {activity.type === 'bottle' && React.createElement(HiUserGroup as React.ComponentType)}
                  {activity.type === 'event' && React.createElement(HiFire as React.ComponentType)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>{activity.text}</ActivityText>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityFeed>
        </PremiumCard>

        <PremiumCard>
          <CardHeader>
            {React.createElement(HiBolt as React.ComponentType)}
            <CardTitle style={{ marginBottom: 0 }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardDescription>
            Fast access to common tasks
          </CardDescription>

          <QuickActionsGrid>
            <QuickActionButton onClick={() => navigate('/events')}>
              {React.createElement(HiCalendarDays as React.ComponentType)}
              Create New Event
            </QuickActionButton>
            <QuickActionButton onClick={() => navigate('/content')}>
              {React.createElement(HiSparkles as React.ComponentType)}
              Moderate Content
            </QuickActionButton>
            <QuickActionButton onClick={() => navigate('/settings/club-info')}>
              {React.createElement(HiUsers as React.ComponentType)}
              Update Club Info
            </QuickActionButton>
            <QuickActionButton onClick={() => navigate('/spending')}>
              {React.createElement(HiTrophy as React.ComponentType)}
              View Leaderboard
            </QuickActionButton>
          </QuickActionsGrid>
        </PremiumCard>
      </ContentWrapper> */}

      <TableCard>
        <TableHeader>
          <CardTitle>🏆 Top 5 Leaderboard</CardTitle>
          <CardDescription>
            The top 5 biggest spenders ranked by their best single-night
            performance
          </CardDescription>
        </TableHeader>

        <RecordsList>
          {topSpenders.length === 0 && (
            <EmptyLeaderboard>
              <EmptyLeaderboardIcon>
                {React.createElement(HiTrophy as React.ComponentType)}
              </EmptyLeaderboardIcon>
              <EmptyLeaderboardTitle>No rankings yet</EmptyLeaderboardTitle>
              <EmptyLeaderboardSubtitle>
                The leaderboard will populate once patrons start spending at
                your club. Top spenders will appear here.
              </EmptyLeaderboardSubtitle>
            </EmptyLeaderboard>
          )}
          {topSpenders.map((spender, index) => {
            const rank = index + 1;
            const isTopSpender = rank === 1;

            return (
              <SpenderItem key={spender.id} rank={rank}>
                <RankBadge rank={rank}>
                  {rank === 1
                    ? React.createElement(HiTrophy as React.ComponentType)
                    : rank}
                </RankBadge>

                <UserSection>
                  <UserAvatar
                    src={spender.user_avatar}
                    alt={spender.username}
                    rank={rank}
                  />
                  <UserInfo>
                    <Username>{spender.username}</Username>
                  </UserInfo>
                </UserSection>

                <NightAmount isTop={isTopSpender}>
                  {formatCurrency(spender.amount)}
                </NightAmount>

                <NightDate>
                  {(() => {
                    const [year, month, day] = spender.visit_date
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
                  {spender.weeksOnChart}{" "}
                  {spender.weeksOnChart === 1 ? "week" : "weeks"}
                </MiniStatValue>
              </SpenderItem>
            );
          })}
        </RecordsList>
      </TableCard>

      {topSpenders.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.xl,
            padding: theme.spacing.xl,
            border: "2px solid rgba(57, 243, 255, 0.2)",
            borderRadius: theme.borderRadius.xl,
            textAlign: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.sm,
            }}
          >
            {React.createElement(HiSparkles as any, {
              style: {
                width: "20px",
                height: "20px",
                color: theme.colors.primary,
              },
            })}
            <span>Want to see the complete rankings?</span>
            {React.createElement(HiSparkles as any, {
              style: {
                width: "20px",
                height: "20px",
                color: theme.colors.primary,
              },
            })}
          </div>
          <OutlineButton
            style={{
              width: "100%",
              fontSize: theme.typography.fontSize.lg,
              padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
              // background:
              //   "linear-gradient(135deg, rgba(57, 243, 255, 0.1) 0%, rgba(138, 43, 226, 0.05) 100%)",
              // borderWidth: "2px",
              fontWeight: theme.typography.fontWeight.bold,
            }}
            onClick={() => navigate("/spending")}
          >
            <span
              style={{ width: "24px", height: "24px", display: "inline-flex" }}
            >
              {React.createElement(HiTrophy as React.ComponentType)}
            </span>
            View Full Leaderboard
            <span
              style={{ width: "24px", height: "24px", display: "inline-flex" }}
            >
              {React.createElement(HiArrowTrendingUp as React.ComponentType)}
            </span>
          </OutlineButton>
        </div>
      )}
    </DashboardContainer>
  );
};
