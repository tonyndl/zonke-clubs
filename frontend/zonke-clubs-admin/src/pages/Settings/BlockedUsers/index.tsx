import React, { useState } from "react";
import { Card, CardTitle, CardDescription } from "../../../components/Card";
import { OutlineButton, DangerButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import { RiUserForbidLine, RiUserUnfollowLine } from "react-icons/ri";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  UserList,
  UserCard,
  UserInfo,
  UserAvatar,
  UserDetails,
  Username,
  BlockDate,
  EmptyState,
} from "./styles";

const mockBlockedUsers = [
  {
    id: "1",
    username: "troublemaker_23",
    avatar: "https://i.pravatar.cc/150?img=33",
    blockedDate: "2026-01-20",
    reason: "Inappropriate behavior",
  },
  {
    id: "2",
    username: "spam_account",
    avatar: "https://i.pravatar.cc/150?img=45",
    blockedDate: "2026-01-18",
    reason: "Spam posting",
  },
];

export const BlockedUsers: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);

  const handleUnblock = (userId: string, username: string) => {
    if (window.confirm(`Unblock ${username}?`)) {
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      alert(`${username} has been unblocked`);
    }
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Blocked Users</PageTitle>
        <PageDescription>
          Manage users who have been blocked from posting or interacting with
          your club.
        </PageDescription>
      </PageHeader>

      {blockedUsers.length > 0 ? (
        <Card style={{ padding: theme.spacing.xl }}>
          <CardTitle style={{ marginBottom: theme.spacing.lg }}>
            Blocked Users ({blockedUsers.length})
          </CardTitle>

          <UserList>
            {blockedUsers.map((user) => (
              <UserCard key={user.id}>
                <UserInfo>
                  <UserAvatar src={user.avatar} alt={user.username} />
                  <UserDetails>
                    <Username>{user.username}</Username>
                    <BlockDate>
                      Blocked on{" "}
                      {new Date(user.blockedDate).toLocaleDateString()} •{" "}
                      {user.reason}
                    </BlockDate>
                  </UserDetails>
                </UserInfo>
                <DangerButton
                  onClick={() => handleUnblock(user.id, user.username)}
                >
                  {React.createElement(
                    RiUserUnfollowLine as React.ComponentType,
                  )}
                  Unblock
                </DangerButton>
              </UserCard>
            ))}
          </UserList>
        </Card>
      ) : (
        <Card>
          <EmptyState>
            {React.createElement(RiUserForbidLine as React.ComponentType)}
            <CardTitle>No Blocked Users</CardTitle>
            <CardDescription>
              You haven't blocked any users yet. Users can be blocked from the
              content moderation page.
            </CardDescription>
          </EmptyState>
        </Card>
      )}
    </SettingsContainer>
  );
};
