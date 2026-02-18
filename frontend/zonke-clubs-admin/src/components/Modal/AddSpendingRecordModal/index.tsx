import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../Modal";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import { DatePicker } from "../../DatePicker/DatePicker";
import {
  RiUserLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiGroupLine,
  RiAddLine,
  RiCloseLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import {
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  CustomerSearchContainer,
  CustomerSuggestions,
  CustomerSuggestion,
  CustomerAvatar,
  CustomerInfo,
  CustomerName,
  CustomerEmail,
  SelectedCustomer,
  ClearButton,
  AmountInputContainer,
  CurrencyPrefix,
  AmountInput,
  FormActions,
  HelpText,
  ToggleSwitch,
  Switch,
  SwitchLabel,
  GroupSection,
  GroupHeader,
  GroupTitle,
  AddMemberButton,
  GroupMembersList,
  GroupMemberItem,
  MemberAvatar,
  MemberInfo,
  MemberName,
  MemberAmount,
  RemoveMemberButton,
  SplitTypeSelector,
  SplitTypeButton,
  TotalSummary,
  SummaryLabel,
  SummaryValue,
} from "./styles";

interface AddSpendingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: SpendingRecordFormData) => void;
  initialGroupMode?: boolean;
}

export interface GroupMember {
  customerId: string;
  customerName: string;
  customerAvatar: string;
  splitAmount: number;
}

export interface SpendingRecordFormData {
  customerId: string;
  customerName: string;
  customerAvatar: string;
  amount: string;
  visitDate: string;
  notes: string;
  isGroup?: boolean;
  groupMembers?: GroupMember[];
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

export const AddSpendingRecordModal: React.FC<AddSpendingRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialGroupMode = false,
}) => {
  const [formData, setFormData] = useState<SpendingRecordFormData>({
    customerId: "",
    customerName: "",
    customerAvatar: "",
    amount: "",
    visitDate: new Date().toISOString().split("T")[0],
    notes: "",
    isGroup: initialGroupMode,
    groupMembers: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Update isGroup when modal opens with initialGroupMode
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        isGroup: initialGroupMode,
      }));
    }
  }, [isOpen, initialGroupMode]);

  // Debounced search for users
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    const excludeIds = [
      formData.customerId,
      ...(formData.groupMembers?.map((m) => m.customerId) || []),
    ].filter(Boolean);

    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      apiService
        .searchUsers(searchQuery, excludeIds, 10)
        .then((response) => {
          setUsers(response.users || []);
        })
        .catch((error) => {
          console.error("Error searching users:", error);
          setUsers([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, formData.customerId, formData.groupMembers]);

  const handleCustomerSelect = (user: User) => {
    const fullName = user.username;
    setFormData((prev) => ({
      ...prev,
      customerId: user.id,
      customerName: fullName || user.username,
      customerAvatar: user.avatar_url || "",
    }));
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleClearCustomer = () => {
    setFormData((prev) => ({
      ...prev,
      customerId: "",
      customerName: "",
      customerAvatar: "",
    }));
  };

  const handleChange = (
    field: keyof SpendingRecordFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleGroup = () => {
    setFormData((prev) => ({
      ...prev,
      isGroup: !prev.isGroup,
      groupMembers: !prev.isGroup ? [] : prev.groupMembers,
    }));
  };

  const handleAddGroupMember = (user: User) => {
    const totalAmount = parseFloat(formData.amount) || 0;
    const currentMembers = formData.groupMembers || [];
    const fullName = user.username;

    // If this is the first member and no customerId is set, make them the primary customer
    if (currentMembers.length === 0 && !formData.customerId) {
      const splitAmount =
        splitType === "equal" && totalAmount > 0 ? totalAmount : 0;
      setFormData((prev) => ({
        ...prev,
        customerId: user.id,
        customerName: fullName || user.username,
        customerAvatar: user.avatar_url || "",
        groupMembers: [
          {
            customerId: user.id,
            customerName: fullName || user.username,
            customerAvatar: user.avatar_url || "",
            splitAmount,
          },
        ],
      }));
    } else {
      // Add as additional member
      const newMemberCount = currentMembers.length + 1;
      const splitAmount =
        splitType === "equal" && totalAmount > 0
          ? totalAmount / newMemberCount
          : 0;

      // Recalculate split for all members if equal split
      const updatedMembers =
        splitType === "equal"
          ? currentMembers.map((m) => ({ ...m, splitAmount }))
          : currentMembers;

      setFormData((prev) => ({
        ...prev,
        groupMembers: [
          ...updatedMembers,
          {
            customerId: user.id,
            customerName: fullName || user.username,
            customerAvatar: user.avatar_url || "",
            splitAmount,
          },
        ],
      }));
    }

    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleRemoveGroupMember = (customerId: string) => {
    const updatedMembers =
      formData.groupMembers?.filter((m) => m.customerId !== customerId) || [];

    // If removing all members, clear the customerId too
    if (updatedMembers.length === 0) {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
        customerAvatar: "",
        groupMembers: [],
      }));
    } else {
      // Update customerId to first member if the current customerId is being removed
      const newCustomerId =
        customerId === formData.customerId
          ? updatedMembers[0].customerId
          : formData.customerId;
      const newCustomer = updatedMembers.find(
        (m) => m.customerId === newCustomerId,
      );

      setFormData((prev) => ({
        ...prev,
        customerId: newCustomerId,
        customerName: newCustomer?.customerName || prev.customerName,
        customerAvatar: newCustomer?.customerAvatar || prev.customerAvatar,
        groupMembers: updatedMembers,
      }));
    }
  };

  const handleMemberAmountChange = (customerId: string, amount: string) => {
    setFormData((prev) => ({
      ...prev,
      groupMembers:
        prev.groupMembers?.map((m) =>
          m.customerId === customerId
            ? { ...m, splitAmount: parseFloat(amount) || 0 }
            : m,
        ) || [],
    }));
  };

  const recalculateSplits = (totalAmount: number) => {
    if (
      splitType === "equal" &&
      formData.groupMembers &&
      formData.groupMembers.length > 0
    ) {
      const memberCount = formData.groupMembers.length;
      const splitAmount = totalAmount / memberCount;

      setFormData((prev) => ({
        ...prev,
        groupMembers:
          prev.groupMembers?.map((m) => ({
            ...m,
            splitAmount,
          })) || [],
      }));
    }
  };

  const handleAmountChange = (value: string) => {
    handleChange("amount", value);
    if (formData.isGroup && splitType === "equal") {
      recalculateSplits(parseFloat(value) || 0);
    }
  };

  const handleSplitTypeChange = (type: "equal" | "custom") => {
    setSplitType(type);
    if (type === "equal" && formData.amount) {
      recalculateSplits(parseFloat(formData.amount) || 0);
    }
  };

  const getTotalGroupSpending = () => {
    if (!formData.groupMembers || formData.groupMembers.length === 0) {
      return parseFloat(formData.amount) || 0;
    }

    if (splitType === "equal") {
      return parseFloat(formData.amount) || 0;
    } else {
      return formData.groupMembers.reduce((sum, m) => sum + m.splitAmount, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      customerId: "",
      customerName: "",
      customerAvatar: "",
      amount: "",
      visitDate: new Date().toISOString().split("T")[0],
      notes: "",
      isGroup: false,
      groupMembers: [],
    });
    setSearchQuery("");
    setSplitType("equal");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        formData.isGroup ? "Split Bill - Group Spending" : "Add Spending Record"
      }
      maxWidth="650px"
    >
      <Form onSubmit={handleSubmit}>
        {!formData.isGroup && (
          <FormGroup>
            <Label>
              {React.createElement(RiUserLine as React.ComponentType)}
              Primary Customer
            </Label>
            {!formData.customerId ? (
              <CustomerSearchContainer>
                <Input
                  type="text"
                  placeholder="Search for a customer..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && searchQuery && users.length > 0 && (
                  <CustomerSuggestions>
                    {users.map((user) => {
                      const fullName = user.username;
                      return (
                        <CustomerSuggestion
                          key={user.id}
                          onClick={() => handleCustomerSelect(user)}
                        >
                          <CustomerAvatar
                            src={
                              user.avatar_url ||
                              "https://i.pravatar.cc/150?img=0"
                            }
                            alt={fullName || user.username}
                          />
                          <CustomerInfo>
                            <CustomerName>
                              {fullName || user.username}
                            </CustomerName>
                            <CustomerEmail>@{user.username}</CustomerEmail>
                          </CustomerInfo>
                        </CustomerSuggestion>
                      );
                    })}
                  </CustomerSuggestions>
                )}
              </CustomerSearchContainer>
            ) : (
              <SelectedCustomer>
                <CustomerAvatar
                  src={formData.customerAvatar}
                  alt={formData.customerName}
                />
                <CustomerInfo>
                  <CustomerName>{formData.customerName}</CustomerName>
                </CustomerInfo>
                <ClearButton type="button" onClick={handleClearCustomer}>
                  Change
                </ClearButton>
              </SelectedCustomer>
            )}
            <HelpText>Search by name or email to select the customer</HelpText>
          </FormGroup>
        )}

        <ToggleSwitch onClick={handleToggleGroup}>
          <Switch active={formData.isGroup || false} />
          <SwitchLabel>
            {React.createElement(RiGroupLine as React.ComponentType)}
            Group Spending (Split bill between multiple people)
          </SwitchLabel>
        </ToggleSwitch>

        {formData.isGroup && (
          <GroupSection>
            <GroupHeader>
              <GroupTitle>
                {React.createElement(RiGroupLine as React.ComponentType)}
                Group Members
              </GroupTitle>
            </GroupHeader>

            <SplitTypeSelector>
              <SplitTypeButton
                type="button"
                active={splitType === "equal"}
                onClick={() => handleSplitTypeChange("equal")}
              >
                Split Equally
              </SplitTypeButton>
              <SplitTypeButton
                type="button"
                active={splitType === "custom"}
                onClick={() => handleSplitTypeChange("custom")}
              >
                Custom Split
              </SplitTypeButton>
            </SplitTypeSelector>

            <GroupMembersList>
              {/* All Group Members */}
              {formData.groupMembers?.map((member) => (
                <GroupMemberItem key={member.customerId}>
                  <MemberAvatar
                    src={member.customerAvatar}
                    alt={member.customerName}
                  />
                  <MemberInfo>
                    <MemberName>{member.customerName}</MemberName>
                    {splitType === "custom" ? (
                      <AmountInputContainer style={{ marginTop: "4px" }}>
                        <CurrencyPrefix
                          style={{ fontSize: "12px", left: "8px" }}
                        >
                          R
                        </CurrencyPrefix>
                        <Input
                          type="number"
                          value={member.splitAmount}
                          onChange={(e) =>
                            handleMemberAmountChange(
                              member.customerId,
                              e.target.value,
                            )
                          }
                          style={{
                            padding: "4px 8px 4px 24px",
                            fontSize: "14px",
                            height: "32px",
                          }}
                          step="0.01"
                          min="0"
                        />
                      </AmountInputContainer>
                    ) : (
                      <MemberAmount>
                        R{member.splitAmount.toFixed(2)}
                      </MemberAmount>
                    )}
                  </MemberInfo>
                  <RemoveMemberButton
                    type="button"
                    onClick={() => handleRemoveGroupMember(member.customerId)}
                  >
                    {React.createElement(RiCloseLine as React.ComponentType)}
                  </RemoveMemberButton>
                </GroupMemberItem>
              ))}

              {/* Add Member */}
              <CustomerSearchContainer>
                <Input
                  type="text"
                  placeholder="Add another group member..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && searchQuery && users.length > 0 && (
                  <CustomerSuggestions>
                    {users.map((user) => {
                      const fullName = user.username;
                      return (
                        <CustomerSuggestion
                          key={user.id}
                          onClick={() => handleAddGroupMember(user)}
                        >
                          <CustomerAvatar
                            src={
                              user.avatar_url ||
                              "https://i.pravatar.cc/150?img=0"
                            }
                            alt={fullName || user.username}
                          />
                          <CustomerInfo>
                            <CustomerName>
                              {fullName || user.username}
                            </CustomerName>
                            <CustomerEmail>@{user.username}</CustomerEmail>
                          </CustomerInfo>
                        </CustomerSuggestion>
                      );
                    })}
                  </CustomerSuggestions>
                )}
              </CustomerSearchContainer>
            </GroupMembersList>

            <TotalSummary>
              <SummaryLabel>Total Group Spending</SummaryLabel>
              <SummaryValue>R{getTotalGroupSpending().toFixed(2)}</SummaryValue>
            </TotalSummary>
          </GroupSection>
        )}

        <FormGroup>
          <Label>
            {React.createElement(
              RiMoneyDollarCircleLine as React.ComponentType,
            )}
            {formData.isGroup ? "Total Amount" : "Amount Spent"}
          </Label>
          <AmountInputContainer>
            <CurrencyPrefix>R</CurrencyPrefix>
            <AmountInput
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </AmountInputContainer>
          <HelpText>
            {formData.isGroup
              ? "Enter the total bill amount to split between group members"
              : "Total amount spent during this visit"}
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiCalendarLine as React.ComponentType)}
            Visit Date
          </Label>
          <DatePicker
            value={formData.visitDate}
            onChange={(date) => handleChange("visitDate", date)}
            minDate={undefined}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiFileTextLine as React.ComponentType)}
            Notes (Optional)
          </Label>
          <TextArea
            placeholder="Add any additional notes about this transaction..."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
          <HelpText>
            e.g., special orders, VIP service, celebration, etc.
          </HelpText>
        </FormGroup>

        <FormActions>
          <OutlineButton type="button" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton
            type="submit"
            disabled={
              formData.isGroup
                ? !formData.groupMembers || formData.groupMembers.length === 0
                : !formData.customerId
            }
          >
            Add Record
          </PrimaryButton>
        </FormActions>
      </Form>
    </Modal>
  );
};
