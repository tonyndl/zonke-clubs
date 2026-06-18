import React, { useState, useEffect, useCallback } from "react";
import {
  RiFlashlightLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiTimeLine,
  RiRefreshLine,
  RiWifiLine,
} from "react-icons/ri";
import { apiService } from "../../services/api";
import {
  strobeAdminService,
  type DJApproval,
} from "../../services/strobeAdminService";
import { adminSocketService } from "../../services/adminSocketService";
import {
  StrobeContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  SectionTitle,
  Badge,
  ApprovalList,
  ApprovalCard,
  Avatar,
  DJInfo,
  DJName,
  ExpiresAt,
  Actions,
  ApproveButton,
  RevokeButton,
  EmptyState,
  CountChip,
} from "./styles";

export const Strobe: React.FC = () => {
  const [clubId, setClubId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<DJApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pending = approvals.filter((a) => a.status === "pending");
  const approved = approvals.filter((a) => a.status === "approved");

  const loadApprovals = useCallback((cid: string) => {
    setLoading(true);
    strobeAdminService
      .getClubApprovals(cid)
      .then((data) => setApprovals(data))
      .catch((err) => console.error("Failed to load strobe approvals", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    apiService
      .getMyClub()
      .then((club: any) => {
        if (club?.id) {
          setClubId(club.id);
          loadApprovals(club.id);

          // Join the strobe channel for real-time updates
          adminSocketService.joinStrobeChannel(club.id);
        }
      })
      .catch((err) => {
        console.error("Failed to load club", err);
        setLoading(false);
      });

    return () => {
      adminSocketService.leaveStrobeChannel();
    };
  }, [loadApprovals]);

  // Listen for real-time DJ request events
  useEffect(() => {
    const handleNewRequest = (payload: any) => {
      if (!payload?.approval) return;
      const newApproval: DJApproval = {
        id: payload.approval.id,
        dj_user_id: payload.approval.dj_user_id,
        club_id: payload.approval.club_id,
        status: payload.approval.status,
        expires_at: payload.approval.expires_at,
        dj_user: payload.approval.dj_user,
      };
      setApprovals((prev) => {
        // Avoid duplicates
        if (prev.some((a) => a.id === newApproval.id)) return prev;
        return [newApproval, ...prev];
      });
    };

    const handleRequestCancelled = (payload: any) => {
      if (!payload?.dj_user_id) return;
      setApprovals((prev) =>
        prev.filter((a) => a.dj_user_id !== payload.dj_user_id),
      );
    };

    const handleApprovalApproved = (payload: any) => {
      if (!payload?.approval) return;
      const updated: DJApproval = payload.approval;
      setApprovals((prev) => {
        const exists = prev.some((a) => a.id === updated.id);
        if (exists) return prev.map((a) => (a.id === updated.id ? updated : a));
        return prev
          .filter((a) => a.dj_user_id !== updated.dj_user_id)
          .concat(updated);
      });
    };

    const handleApprovalRevoked = (payload: any) => {
      if (!payload?.dj_user_id) return;
      setApprovals((prev) =>
        prev.filter((a) => a.dj_user_id !== payload.dj_user_id),
      );
    };

    const unsub1 = adminSocketService.on("new_dj_request", handleNewRequest);
    const unsub2 = adminSocketService.on(
      "dj_request_cancelled",
      handleRequestCancelled,
    );
    const unsub3 = adminSocketService.on(
      "dj_approval_approved",
      handleApprovalApproved,
    );
    const unsub4 = adminSocketService.on(
      "dj_approval_revoked",
      handleApprovalRevoked,
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const handleApprove = (djUserId: string) => {
    if (!clubId) return;
    setActionLoading(djUserId);
    strobeAdminService
      .approveDJ(clubId, djUserId)
      .then((updated) => {
        setApprovals((prev) =>
          prev.map((a) => (a.dj_user_id === djUserId ? updated : a)),
        );
      })
      .catch((err) => console.error("Failed to approve DJ", err))
      .finally(() => setActionLoading(null));
  };

  const handleRevoke = (djUserId: string) => {
    if (!clubId) return;
    setActionLoading(djUserId);
    strobeAdminService
      .revokeApproval(clubId, djUserId)
      .then(() => {
        setApprovals((prev) => prev.filter((a) => a.dj_user_id !== djUserId));
      })
      .catch((err) => console.error("Failed to revoke approval", err))
      .finally(() => setActionLoading(null));
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const d = new Date(expiresAt);
    return `Expires ${d.toLocaleString()}`;
  };

  const djInitial = (approval: DJApproval) => {
    const name = approval.dj_user?.username || "?";
    return name[0].toUpperCase();
  };

  return (
    <StrobeContainer>
      <PageHeader>
        <div>
          <PageTitle>DJ Strobe Requests</PageTitle>
          <PageDescription>
            Approve or revoke DJ strobe control access for your venue. Approvals
            are valid for 24 hours. Requests appear in real-time.
          </PageDescription>
        </div>
        {clubId && (
          <RevokeButton
            onClick={() => loadApprovals(clubId)}
            disabled={loading}
            style={{ alignSelf: "center" }}
          >
            {React.createElement(RiRefreshLine as React.ComponentType)}
            Refresh
          </RevokeButton>
        )}
      </PageHeader>

      {/* Pending Requests */}
      <SectionTitle>
        {React.createElement(RiTimeLine as React.ComponentType)}
        Pending Requests
        {pending.length > 0 && <CountChip>{pending.length}</CountChip>}
      </SectionTitle>

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : pending.length === 0 ? (
        <EmptyState>
          {React.createElement(RiUserLine as React.ComponentType)}
          No pending requests
        </EmptyState>
      ) : (
        <ApprovalList>
          {pending.map((approval) => {
            const isActing = actionLoading === approval.dj_user_id;
            return (
              <ApprovalCard key={approval.id}>
                <Avatar>
                  {approval.dj_user?.avatar_url ? (
                    <img
                      src={approval.dj_user.avatar_url}
                      alt={approval.dj_user.username}
                    />
                  ) : (
                    djInitial(approval)
                  )}
                </Avatar>
                <DJInfo>
                  <DJName>@{approval.dj_user?.username}</DJName>
                  <Badge variant="pending">PENDING</Badge>
                </DJInfo>
                <Actions>
                  <ApproveButton
                    onClick={() => handleApprove(approval.dj_user_id)}
                    disabled={isActing}
                  >
                    {React.createElement(RiCheckLine as React.ComponentType)}
                    Approve
                  </ApproveButton>
                  <RevokeButton
                    onClick={() => handleRevoke(approval.dj_user_id)}
                    disabled={isActing}
                  >
                    {React.createElement(RiCloseLine as React.ComponentType)}
                    Deny
                  </RevokeButton>
                </Actions>
              </ApprovalCard>
            );
          })}
        </ApprovalList>
      )}

      {/* Active Approvals */}
      <SectionTitle>
        {React.createElement(RiFlashlightLine as React.ComponentType)}
        Active Approvals
        {approved.length > 0 && <CountChip>{approved.length}</CountChip>}
      </SectionTitle>

      {!loading && approved.length === 0 ? (
        <EmptyState>No active DJ approvals</EmptyState>
      ) : (
        <ApprovalList>
          {approved.map((approval) => {
            const isActing = actionLoading === approval.dj_user_id;
            return (
              <ApprovalCard key={approval.id}>
                <Avatar>
                  {approval.dj_user?.avatar_url ? (
                    <img
                      src={approval.dj_user.avatar_url}
                      alt={approval.dj_user.username}
                    />
                  ) : (
                    djInitial(approval)
                  )}
                </Avatar>
                <DJInfo>
                  <DJName>@{approval.dj_user?.username}</DJName>
                  <Badge variant="approved">APPROVED</Badge>
                  {approval.expires_at && (
                    <ExpiresAt>{formatExpiry(approval.expires_at)}</ExpiresAt>
                  )}
                </DJInfo>
                <Actions>
                  <RevokeButton
                    onClick={() => handleRevoke(approval.dj_user_id)}
                    disabled={isActing}
                  >
                    {React.createElement(RiCloseLine as React.ComponentType)}
                    Revoke
                  </RevokeButton>
                </Actions>
              </ApprovalCard>
            );
          })}
        </ApprovalList>
      )}
    </StrobeContainer>
  );
};
