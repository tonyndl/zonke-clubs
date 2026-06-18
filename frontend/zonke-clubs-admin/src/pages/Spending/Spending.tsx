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
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { HiSparkles } from "react-icons/hi2";
import {
  HiArrowUp,
  HiArrowDown,
  HiMinus,
  HiTrophy,
  HiUser,
} from "react-icons/hi2";
import styled from "styled-components";
import {
  SpendingContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  HeaderActions,
  TableCard,
  TableHeader,
  FilterSection,
  FilterGroup,
  FilterLabel,
  FilterTabs,
  FilterTab,
  EmptyState,
} from "./styles";

// Card internals shared with Dashboard — import directly so they are pixel-identical
import {
  RecordsList,
  SpenderItem as RecordCard,
  UserSection,
  UserAvatar,
  UserInfo,
  Username,
  RankBadge,
  NightAmount,
  NightDate,
} from "../Dashboard/styles";

const AvatarFallback = styled.div<{ rank: number }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid
    ${(props) => {
      if (props.rank === 1) return theme.colors.primary;
      if (props.rank === 2) return "#c0c0c0";
      if (props.rank === 3) return "#cd7f32";
      return theme.colors.border;
    }};
  box-shadow: ${(props) =>
    props.rank === 1 ? theme.shadows.glow : theme.shadows.md};
  background: ${theme.colors.sidebarActiveBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  flex-shrink: 0;

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const Spending: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableGroupMode, setEnableGroupMode] = useState(false);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  console.log(
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    leaderboard,
  );

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

  const handleEdit = (record: any) => setEditingRecord({ ...record });

  const handleEditSave = () => {
    if (!editingRecord?.record_id) return;
    setIsSaving(true);
    apiService
      .updateSpendingRecord(editingRecord.record_id, {
        amount: parseFloat(editingRecord.amount),
        visit_date: editingRecord.visit_date,
        notes: editingRecord.notes,
      })
      .then(() => {
        setEditingRecord(null);
        fetchLeaderboard();
      })
      .catch((err: any) => console.error("Update failed:", err))
      .finally(() => setIsSaving(false));
  };

  const handleDelete = (record: any) => setDeleteConfirm(record);

  const confirmDelete = () => {
    if (!deleteConfirm?.record_id) return;
    setIsDeleting(true);
    apiService
      .deleteSpendingRecord(deleteConfirm.record_id)
      .then(() => {
        setDeleteConfirm(null);
        fetchLeaderboard();
      })
      .catch((err: any) => console.error("Delete failed:", err))
      .finally(() => setIsDeleting(false));
  };

  const formatCurrency = (amount: number) => {
    const fixed = amount.toFixed(2);
    const [integer, decimal] = fixed.split(".");
    const spacedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `R${spacedInteger}.${decimal}`;
  };

  const rankedRecords = leaderboard.map((entry, index) => ({
    record_id: entry.record_id,
    id: entry.user_id,
    user_id: entry.user_id,
    username: entry.username,
    user_avatar: entry.avatar_url,
    amount: parseFloat(entry.amount),
    visit_date: entry.visit_date,
    notes: entry.notes || "",
    rank: entry.rank || index + 1,
    positionChange:
      entry.position_change !== undefined ? entry.position_change : 0,
  }));

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
                    {record.user_avatar ? (
                      <UserAvatar
                        src={record.user_avatar}
                        alt={record.username}
                        rank={record.rank}
                      />
                    ) : (
                      <AvatarFallback rank={record.rank}>
                        {React.createElement(HiUser as React.ComponentType)}
                      </AvatarFallback>
                    )}
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

                  <RecordActions>
                    <ActionBtn title="Edit" onClick={() => handleEdit(record)}>
                      {React.createElement(RiEditLine as React.ComponentType)}
                    </ActionBtn>
                    <ActionBtn
                      title="Delete"
                      danger
                      onClick={() => handleDelete(record)}
                    >
                      {React.createElement(
                        RiDeleteBinLine as React.ComponentType,
                      )}
                    </ActionBtn>
                  </RecordActions>
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
      {/* Edit Modal */}
      {editingRecord && (
        <ModalOverlay onClick={() => setEditingRecord(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>Edit Record — {editingRecord.username}</ModalTitle>
              <CloseBtn onClick={() => setEditingRecord(null)}>✕</CloseBtn>
            </ModalHead>
            <ModalBody>
              <FormField>
                <FormLabel>Amount (R)</FormLabel>
                <FormInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingRecord.amount}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      amount: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField>
                <FormLabel>Visit Date</FormLabel>
                <FormInput
                  type="date"
                  value={editingRecord.visit_date}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      visit_date: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField>
                <FormLabel>Notes</FormLabel>
                <FormInput
                  type="text"
                  value={editingRecord.notes}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      notes: e.target.value,
                    })
                  }
                />
              </FormField>
            </ModalBody>
            <ModalFooter>
              <OutlineButton onClick={() => setEditingRecord(null)}>
                Cancel
              </OutlineButton>
              <PrimaryButton onClick={handleEditSave} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </PrimaryButton>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ModalOverlay onClick={() => setDeleteConfirm(null)}>
          <ModalBox
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <ModalHead>
              <ModalTitle>Delete Record</ModalTitle>
              <CloseBtn onClick={() => setDeleteConfirm(null)}>✕</CloseBtn>
            </ModalHead>
            <ModalBody>
              <p style={{ color: theme.colors.textSecondary, lineHeight: 1.6 }}>
                Remove{" "}
                <strong style={{ color: theme.colors.textPrimary }}>
                  {deleteConfirm.username}
                </strong>
                's{" "}
                <strong style={{ color: theme.colors.textPrimary }}>
                  {formatCurrency(deleteConfirm.amount)}
                </strong>{" "}
                entry from the leaderboard? This cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <OutlineButton onClick={() => setDeleteConfirm(null)}>
                Cancel
              </OutlineButton>
              <DangerButton onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </DangerButton>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}
    </SpendingContainer>
  );
};

// ── Local styled components for edit/delete UI ──────────────────────────────

const RecordActions = styled.div`
  display: flex;
  gap: 6px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;

  ${RecordCard}:hover & {
    opacity: 1;
  }
`;

const ActionBtn = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid
    ${({ danger }) => (danger ? "rgba(239,68,68,0.4)" : "rgba(57,243,255,0.3)")};
  background: ${({ danger }) =>
    danger ? "rgba(239,68,68,0.1)" : "rgba(57,243,255,0.08)"};
  color: ${({ danger }) => (danger ? "#ef4444" : "#39f3ff")};
  cursor: pointer;
  font-size: 15px;
  transition: all 0.15s;

  &:hover {
    background: ${({ danger }) =>
      danger ? "rgba(239,68,68,0.2)" : "rgba(57,243,255,0.18)"};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #0f1628;
  border: 1px solid rgba(57, 243, 255, 0.2);
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 0 40px rgba(57, 243, 255, 0.08);
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  &:hover {
    color: #e2e8f0;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FormInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(57, 243, 255, 0.5);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const DangerButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #dc2626;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
