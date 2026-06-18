import React, { useState, useMemo } from "react";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import {
  RiCloseLine,
  RiSearchLine,
  RiGroupLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Section,
  Label,
  AmountInputWrapper,
  CurrencySymbol,
  AmountInput,
  SearchWrapper,
  SearchIcon,
  SearchInput,
  FriendsList,
  FriendCard,
  FriendAvatar,
  FriendName,
  CalculationCard,
  CalculationRow,
  CalculationLabel,
  CalculationValue,
  Divider,
  NotesInput,
  ModalActions,
  EmptyState,
} from "./styles";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    totalAmount: number;
    selectedFriends: Friend[];
    perPersonAmount: number;
    notes?: string;
  }) => void;
  availableFriends: Friend[];
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableFriends,
}) => {
  const [totalAmount, setTotalAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(
    new Set(),
  );
  const [notes, setNotes] = useState("");

  const filteredFriends = useMemo(() => {
    if (!searchQuery) return availableFriends;
    const query = searchQuery.toLowerCase();
    return availableFriends.filter((friend) =>
      friend.name.toLowerCase().includes(query),
    );
  }, [availableFriends, searchQuery]);

  const selectedFriends = useMemo(() => {
    return availableFriends.filter((friend) =>
      selectedFriendIds.has(friend.id),
    );
  }, [availableFriends, selectedFriendIds]);

  const totalPeople = selectedFriendIds.size + 1; // +1 for the user
  const amount = parseFloat(totalAmount) || 0;
  const perPersonAmount =
    amount > 0 && totalPeople > 0 ? amount / totalPeople : 0;

  const handleFriendToggle = (friendId: string) => {
    const newSelected = new Set(selectedFriendIds);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriendIds(newSelected);
  };

  const handleSubmit = () => {
    if (amount > 0 && selectedFriends.length > 0) {
      onSubmit({
        totalAmount: amount,
        selectedFriends,
        perPersonAmount,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setTotalAmount("");
      setSelectedFriendIds(new Set());
      setNotes("");
      setSearchQuery("");
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return `R${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {React.createElement(
              RiMoneyDollarCircleLine as React.ComponentType,
            )}
            Split the Bill
          </ModalTitle>
          <CloseButton onClick={onClose}>
            {React.createElement(RiCloseLine as React.ComponentType)}
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Amount Section */}
          <Section>
            <Label>Total Amount Spent</Label>
            <AmountInputWrapper>
              <CurrencySymbol>R</CurrencySymbol>
              <AmountInput
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </AmountInputWrapper>
          </Section>

          {/* Friends Selection */}
          <Section>
            <Label>
              {React.createElement(RiGroupLine as React.ComponentType)}
              Who was there? ({selectedFriendIds.size} selected)
            </Label>
            <SearchWrapper>
              <SearchIcon>
                {React.createElement(RiSearchLine as React.ComponentType)}
              </SearchIcon>
              <SearchInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
              />
            </SearchWrapper>

            {filteredFriends.length > 0 ? (
              <FriendsList>
                {filteredFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    selected={selectedFriendIds.has(friend.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriendIds.has(friend.id)}
                      onChange={() => handleFriendToggle(friend.id)}
                    />
                    <FriendAvatar avatar={friend.avatar}>
                      {!friend.avatar && getInitials(friend.name)}
                    </FriendAvatar>
                    <FriendName>{friend.name}</FriendName>
                  </FriendCard>
                ))}
              </FriendsList>
            ) : (
              <EmptyState>
                {searchQuery
                  ? "No friends found matching your search"
                  : "No friends available"}
              </EmptyState>
            )}
          </Section>

          {/* Calculation Summary */}
          {amount > 0 && totalPeople > 1 && (
            <CalculationCard>
              <CalculationRow>
                <CalculationLabel>Total Amount</CalculationLabel>
                <CalculationValue>{formatCurrency(amount)}</CalculationValue>
              </CalculationRow>

              <CalculationRow>
                <CalculationLabel>Split Between</CalculationLabel>
                <CalculationValue>{totalPeople} people</CalculationValue>
              </CalculationRow>

              <Divider />

              <CalculationRow>
                <CalculationLabel>Each Person Pays</CalculationLabel>
                <CalculationValue highlight>
                  {formatCurrency(perPersonAmount)}
                </CalculationValue>
              </CalculationRow>
            </CalculationCard>
          )}

          {/* Optional Notes */}
          <Section>
            <Label>Notes (Optional)</Label>
            <NotesInput
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this night out..."
            />
          </Section>
        </ModalBody>

        <ModalActions>
          <OutlineButton fullWidth onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton
            fullWidth
            onClick={handleSubmit}
            disabled={amount <= 0 || selectedFriends.length === 0}
          >
            Split Bill
          </PrimaryButton>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};
