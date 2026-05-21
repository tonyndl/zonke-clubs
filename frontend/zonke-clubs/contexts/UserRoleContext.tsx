import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "driver" | "owner" | "member" | "user";

export type AccountType = "club-goer" | "club-account";

interface UserRoleContextType {
  // role: UserRole;
  // setRole: (role: UserRole) => void;
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  // isClubAdmin: boolean;
  // isClubMember: boolean;
  // hasClubAccess: boolean;
  isClubAccount: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined,
);

// ===== CHANGE THIS TO SWITCH ACCOUNT TYPES =====
// 'club-account' = Club management dashboard (now web-based)
// 'club-goer' = Regular user browsing clubs
const DEFAULT_ACCOUNT_TYPE: AccountType = "club-goer";
const DEFAULT_ROLE: UserRole = "user";
// ===============================================

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with actual auth context from API
  const [accountType, setAccountType] =
    useState<AccountType>(DEFAULT_ACCOUNT_TYPE);
  // const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);

  // Hot reload support - update state when constants change during development
  useEffect(() => {
    if (__DEV__) {
      setAccountType(DEFAULT_ACCOUNT_TYPE);
      // setRole(DEFAULT_ROLE);
    }
  }, [DEFAULT_ACCOUNT_TYPE]);

  const isClubAccount = accountType === "club-account";
  // const isClubAdmin = role === 'owner';
  // const isClubMember = role === 'member';
  // const hasClubAccess = isClubAdmin || isClubMember;

  return (
    <UserRoleContext.Provider
      value={{
        // role,
        // setRole,
        accountType,
        setAccountType,
        // isClubAdmin,
        // isClubMember,
        // hasClubAccess,
        isClubAccount,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
