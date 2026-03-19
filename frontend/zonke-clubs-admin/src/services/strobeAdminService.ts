import { apiService } from "./api";

export type StrobeApprovalStatus = "pending" | "approved";

export interface DJApproval {
  id: string;
  dj_user_id: string;
  club_id: string;
  status: StrobeApprovalStatus;
  expires_at: string | null;
  dj_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

export const strobeAdminService = {
  getClubApprovals(clubId: string): Promise<DJApproval[]> {
    return apiService
      .get<{ approvals: DJApproval[] }>(`/strobe/clubs/${clubId}/approvals`)
      .then((res) => res.approvals);
  },

  approveDJ(clubId: string, djUserId: string): Promise<DJApproval> {
    return apiService
      .post<{ approval: DJApproval }>(`/strobe/clubs/${clubId}/approve`, {
        dj_user_id: djUserId,
      })
      .then((res) => res.approval);
  },

  revokeApproval(clubId: string, djUserId: string): Promise<void> {
    return apiService
      .delete(`/strobe/clubs/${clubId}/approve?dj_user_id=${djUserId}`)
      .then(() => undefined);
  },
};
