import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { BlurView } from "expo-blur";
import { styles } from "./styles";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  selected: boolean;
  amount: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  totalAmount: number;
};

export function SplitOptionsModal({
  visible,
  onClose,
  onComplete,
  totalAmount,
}: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [splitEqually, setSplitEqually] = useState(true);
  const [myAmount, setMyAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedFriends = friends.filter((f) => f.selected);
  const totalPeople = selectedFriends.length + 1; // +1 for me

  useEffect(() => {
    if (visible && splitEqually) {
      calculateEqualSplit();
    }
  }, [visible, selectedFriends.length, splitEqually, totalAmount]);

  const calculateEqualSplit = () => {
    if (totalPeople === 0) return;
    const perPerson = totalAmount / totalPeople;
    setMyAmount(perPerson);
    setFriends((prev) =>
      prev.map((f) => ({
        ...f,
        amount: f.selected ? perPerson : 0,
      })),
    );
  };

  const toggleFriend = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)),
    );
  };

  const updateFriendAmount = (id: string, amount: number) => {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, amount } : f)));
    updateMyAmount();
  };

  const updateMyAmount = () => {
    const friendsTotal = friends.reduce(
      (sum, f) => sum + (f.selected ? f.amount : 0),
      0,
    );
    setMyAmount(totalAmount - friendsTotal);
  };

  const handleSplitEquallyToggle = (value: boolean) => {
    setSplitEqually(value);
    if (value) {
      calculateEqualSplit();
    }
  };

  const handleComplete = () => {
    const splits = selectedFriends.map((f) => ({
      friendId: f.id,
      friendName: f.name,
      amount: f.amount,
    }));

    onComplete({
      totalAmount,
      myShare: myAmount,
      splits,
      splitEqually,
    });
  };

  const getRemainingAmount = () => {
    const allocated =
      myAmount +
      friends.reduce((sum, f) => sum + (f.selected ? f.amount : 0), 0);
    return totalAmount - allocated;
  };

  const isValid =
    Math.abs(getRemainingAmount()) < 0.01 && selectedFriends.length > 0;

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.bg, Colors.bgCard]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.platinum} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Split Bill</Text>
              <Text style={styles.headerSubtitle}>
                R{totalAmount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleComplete}
              disabled={!isValid}
              style={styles.doneButton}
            >
              <Text
                style={[
                  styles.doneButtonText,
                  !isValid && styles.doneButtonTextDisabled,
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Split Equally Toggle */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleCard}>
              <View style={styles.toggleInfo}>
                <Ionicons name="apps" size={20} color={Colors.gold} />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>Split Equally</Text>
                  <Text style={styles.toggleSubtitle}>
                    {splitEqually
                      ? `R${(totalAmount / totalPeople).toFixed(2)} per person`
                      : "Custom amounts for each person"}
                  </Text>
                </View>
              </View>
              <Switch
                value={splitEqually}
                onValueChange={handleSplitEquallyToggle}
                trackColor={{
                  false: "rgba(57, 243, 255, 0.2)",
                  true: Colors.gold,
                }}
                thumbColor="white"
              />
            </View>
          </View>

          {/* My Share */}
          <View style={styles.myShareSection}>
            <Text style={styles.sectionLabel}>Your Share</Text>
            <View style={styles.myShareCard}>
              <LinearGradient
                colors={[
                  "rgba(57, 243, 255, 0.15)",
                  "rgba(57, 243, 255, 0.05)",
                ]}
                style={styles.myShareGradient}
              >
                <View style={styles.myShareContent}>
                  <View style={styles.myShareLeft}>
                    <View style={styles.myAvatar}>
                      <Text style={styles.myAvatarText}>Me</Text>
                    </View>
                    <Text style={styles.myShareName}>You</Text>
                  </View>
                  <View style={styles.myShareRight}>
                    {splitEqually ? (
                      <Text style={styles.myShareAmount}>
                        R{myAmount.toFixed(2)}
                      </Text>
                    ) : (
                      <View style={styles.customAmountInput}>
                        <Text style={styles.currencySymbol}>R</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={myAmount.toFixed(2)}
                          onChangeText={(text) => {
                            const val = parseFloat(text) || 0;
                            setMyAmount(val);
                          }}
                          keyboardType="decimal-pad"
                          selectTextOnFocus
                        />
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Friends Selection */}
          <View style={styles.friendsSection}>
            <Text style={styles.sectionLabel}>
              Select Friends ({selectedFriends.length})
            </Text>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={Colors.smoke}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                placeholderTextColor={Colors.smoke}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Friends List */}
            <ScrollView
              style={styles.friendsList}
              showsVerticalScrollIndicator={false}
            >
              {filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendCard,
                    friend.selected && styles.friendCardSelected,
                  ]}
                  onPress={() => toggleFriend(friend.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.friendLeft}>
                    <View
                      style={[
                        styles.friendAvatar,
                        friend.selected && styles.friendAvatarSelected,
                      ]}
                    >
                      <Text style={styles.friendAvatarText}>
                        {friend.avatar}
                      </Text>
                      {friend.selected && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.friendName,
                        friend.selected && styles.friendNameSelected,
                      ]}
                    >
                      {friend.name}
                    </Text>
                  </View>

                  {friend.selected && (
                    <View style={styles.friendRight}>
                      {splitEqually ? (
                        <Text style={styles.friendAmount}>
                          R{friend.amount.toFixed(2)}
                        </Text>
                      ) : (
                        <View style={styles.customAmountInput}>
                          <Text style={styles.currencySymbolSmall}>R</Text>
                          <TextInput
                            style={styles.amountInputSmall}
                            value={friend.amount.toFixed(2)}
                            onChangeText={(text) => {
                              const val = parseFloat(text) || 0;
                              updateFriendAmount(friend.id, val);
                            }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                          />
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Summary Footer */}
          <View style={styles.footer}>
            <BlurView intensity={30} style={styles.footerBlur}>
              <LinearGradient
                colors={["rgba(11, 15, 26, 0.95)", "rgba(26, 30, 42, 0.95)"]}
                style={styles.footerGradient}
              >
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryValue}>
                    R{totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Allocated</Text>
                  <Text style={styles.summaryValue}>
                    R{(totalAmount - getRemainingAmount()).toFixed(2)}
                  </Text>
                </View>
                {Math.abs(getRemainingAmount()) > 0.01 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.remainingLabel]}>
                      Remaining
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        getRemainingAmount() > 0
                          ? styles.remainingPositive
                          : styles.remainingNegative,
                      ]}
                    >
                      R{Math.abs(getRemainingAmount()).toFixed(2)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    !isValid && { backgroundColor: "rgba(128, 128, 128, 0.5)" },
                  ]}
                  onPress={handleComplete}
                  disabled={!isValid}
                  activeOpacity={0.8}
                >
                  <View style={styles.completeButtonGradient}>
                    <Text
                      style={[
                        styles.completeButtonText,
                        !isValid && styles.completeButtonTextDisabled,
                      ]}
                    >
                      {isValid
                        ? "Confirm Split"
                        : selectedFriends.length === 0
                          ? "Select at least one friend"
                          : "Balance the amounts"}
                    </Text>
                    {isValid && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.bgCard}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
