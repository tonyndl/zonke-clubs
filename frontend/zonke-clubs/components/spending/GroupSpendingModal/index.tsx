import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Colors, Gradients } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";
import { groupSpendingAmountSchema, parseZodErrors } from "@/utils/validation";

type Member = {
  id: string;
  name: string;
  avatar: string;
  username?: string;
  selected: boolean;
  amount: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: GroupSpendingData) => void;
  members?: Member[];
  clubName?: string;
};

export type GroupSpendingData = {
  totalAmount: number;
  splits: Array<{
    memberId: string;
    memberName: string;
    amount: number;
  }>;
  splitType: "equal" | "custom";
  timestamp: string;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?img=12",
    username: "alexj",
    selected: false,
    amount: 0,
  },
  {
    id: "2",
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?img=47",
    username: "sarahw",
    selected: false,
    amount: 0,
  },
  {
    id: "3",
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=33",
    username: "mikec",
    selected: false,
    amount: 0,
  },
  {
    id: "4",
    name: "Emma Davis",
    avatar: "https://i.pravatar.cc/150?img=23",
    username: "emmad",
    selected: false,
    amount: 0,
  },
  {
    id: "5",
    name: "James Wilson",
    avatar: "https://i.pravatar.cc/150?img=14",
    username: "jamesw",
    selected: false,
    amount: 0,
  },
  {
    id: "6",
    name: "Olivia Brown",
    avatar: "https://i.pravatar.cc/150?img=45",
    username: "oliviab",
    selected: false,
    amount: 0,
  },
  {
    id: "7",
    name: "Liam Martinez",
    avatar: "https://i.pravatar.cc/150?img=68",
    username: "liamm",
    selected: false,
    amount: 0,
  },
  {
    id: "8",
    name: "Sophia Taylor",
    avatar: "https://i.pravatar.cc/150?img=32",
    username: "sophiat",
    selected: false,
    amount: 0,
  },
];

export function GroupSpendingModal({
  visible,
  onClose,
  onComplete,
  members = MOCK_MEMBERS,
  clubName = "The Club",
}: Props) {
  const [step, setStep] = useState<"amount" | "members" | "split" | "confirm">(
    "amount",
  );
  const [totalAmount, setTotalAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
      resetState();
    }
  }, [visible]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [step]);

  const resetState = () => {
    setStep("amount");
    setTotalAmount("");
    setAmountError("");
    setSelectedMembers([]);
    setSplitType("equal");
    setSearchQuery("");
    setShowSuccess(false);
    scaleAnim.setValue(0);
  };

  const handleAmountNext = () => {
    const result = groupSpendingAmountSchema.safeParse({ amount: totalAmount });
    if (!result.success) {
      const errs = parseZodErrors(result.error);
      setAmountError(errs.amount || "Please enter a valid amount");
      return;
    }
    setAmountError("");
    setStep("members");
    scaleAnim.setValue(0);
  };

  const toggleMember = (member: Member) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers([
        ...selectedMembers,
        { ...member, selected: true, amount: 0 },
      ]);
    }
  };

  const handleMembersNext = () => {
    if (selectedMembers.length > 0) {
      calculateSplit();
      setStep("split");
      scaleAnim.setValue(0);
    }
  };

  const calculateSplit = () => {
    const amount = parseFloat(totalAmount);
    const perPerson = amount / selectedMembers.length;
    setSelectedMembers((prev) =>
      prev.map((m) => ({
        ...m,
        amount: splitType === "equal" ? perPerson : m.amount,
      })),
    );
  };

  useEffect(() => {
    if (step === "split" && splitType === "equal") {
      calculateSplit();
    }
  }, [splitType, step]);

  const updateMemberAmount = (memberId: string, amount: number) => {
    setSelectedMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, amount } : m)),
    );
  };

  const getTotalAllocated = () => {
    return selectedMembers.reduce((sum, m) => sum + m.amount, 0);
  };

  const getRemaining = () => {
    return parseFloat(totalAmount) - getTotalAllocated();
  };

  const isValidSplit = () => {
    return Math.abs(getRemaining()) < 0.01 && selectedMembers.length > 0;
  };

  const handleConfirm = () => {
    if (isValidSplit()) {
      setShowSuccess(true);

      // Confetti animation
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        const data: GroupSpendingData = {
          totalAmount: parseFloat(totalAmount),
          splits: selectedMembers.map((m) => ({
            memberId: m.id,
            memberName: m.name,
            amount: m.amount,
          })),
          splitType,
          timestamp: new Date().toISOString(),
        };
        onComplete(data);
        onClose();
      }, 2000);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderStepIndicator = () => {
    const steps = [
      { key: "amount", label: "Amount", icon: "cash" },
      { key: "members", label: "Members", icon: "people" },
      { key: "split", label: "Split", icon: "calculator" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, index) => {
          const isActive = s.key === step;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={s.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color={Colors.bg} />
                  ) : (
                    <Ionicons
                      name={s.icon as any}
                      size={16}
                      color={isActive ? Colors.bg : Colors.smoke}
                    />
                  )}
                </View>
                <Text
                  style={[styles.stepLabel, isActive && styles.stepLabelActive]}
                >
                  {s.label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderAmountStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: scaleAnim,
        },
      ]}
    >
      <View style={styles.amountContainer}>
        <Text style={styles.stepTitle}>Enter Total Amount</Text>
        <Text style={styles.stepSubtitle}>
          How much was spent at {clubName}?
        </Text>

        <View style={styles.amountInputContainer}>
          <LinearGradient
            colors={["rgba(57, 243, 255, 0.2)", "rgba(57, 243, 255, 0.05)"]}
            style={styles.amountInputGradient}
          >
            <Text style={styles.currencySymbolLarge}>R</Text>
            <TextInput
              style={styles.amountInput}
              value={totalAmount}
              onChangeText={(text) => {
                setTotalAmount(text);
                setAmountError("");
              }}
              placeholder="0.00"
              placeholderTextColor={Colors.smoke}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
          </LinearGradient>
        </View>
        {!!amountError && <Text style={amountErrorStyle}>{amountError}</Text>}

        <View style={styles.quickAmounts}>
          {[50, 100, 200, 500].map((amount) => (
            <PressableScale
              key={amount}
              style={styles.quickAmountButton}
              onPress={() => setTotalAmount(amount.toString())}
            >
              <Text style={styles.quickAmountText}>R{amount}</Text>
            </PressableScale>
          ))}
        </View>

        <PressableScale style={styles.nextButton} onPress={handleAmountNext}>
          <LinearGradient
            colors={Gradients.accent}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.bg} />
          </LinearGradient>
        </PressableScale>
      </View>
    </Animated.View>
  );

  const renderMembersStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: scaleAnim,
        },
      ]}
    >
      <View style={styles.membersContainer}>
        <Text style={styles.stepTitle}>Select Members</Text>
        <Text style={styles.stepSubtitle}>
          Who was part of this group? ({selectedMembers.length} selected)
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.smoke} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor={Colors.smoke}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Members Preview */}
        {selectedMembers.length > 0 && (
          <View style={styles.selectedPreview}>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedPreviewContent}
            >
              {selectedMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={styles.selectedMemberChip}
                  onPress={() => toggleMember(member)}
                >
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.selectedMemberAvatar}
                  />
                  <View style={styles.selectedMemberRemove}>
                    <Ionicons name="close" size={12} color={Colors.bg} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Members Grid */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.membersScroll}
          contentContainerStyle={styles.membersGrid}
          showsVerticalScrollIndicator={false}
        >
          {filteredMembers.map((member, index) => {
            const isSelected = selectedMembers.some((m) => m.id === member.id);
            return (
              <Animated.View
                key={member.id}
                style={{
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                  opacity: scaleAnim,
                }}
              >
                <PressableScale
                  style={[
                    styles.memberCard,
                    isSelected && styles.memberCardSelected,
                  ]}
                  onPress={() => toggleMember(member)}
                >
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.memberAvatar}
                  />
                  {isSelected && (
                    <LinearGradient
                      colors={[
                        "rgba(57, 243, 255, 0.9)",
                        "rgba(57, 243, 255, 0.7)",
                      ]}
                      style={styles.memberCheckBadge}
                    >
                      <Ionicons name="checkmark" size={16} color={Colors.bg} />
                    </LinearGradient>
                  )}
                  <Text
                    style={[
                      styles.memberName,
                      isSelected && styles.memberNameSelected,
                    ]}
                  >
                    {member.name.split(" ")[0]}
                  </Text>
                </PressableScale>
              </Animated.View>
            );
          })}
        </ScrollView>

        <View style={styles.stepFooter}>
          <PressableScale
            style={styles.backButton}
            onPress={() => setStep("amount")}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.platinum} />
            <Text style={styles.backButtonText}>Back</Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.nextButton,
              selectedMembers.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={handleMembersNext}
            disabled={selectedMembers.length === 0}
          >
            <LinearGradient
              colors={
                selectedMembers.length > 0
                  ? Gradients.accent
                  : ["rgba(128, 128, 128, 0.3)", "rgba(128, 128, 128, 0.3)"]
              }
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Split Bill</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.bg} />
            </LinearGradient>
          </PressableScale>
        </View>
      </View>
    </Animated.View>
  );

  const renderSplitStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
          opacity: scaleAnim,
        },
      ]}
    >
      <View style={styles.splitContainer}>
        <Text style={styles.stepTitle}>Split the Bill</Text>
        <Text style={styles.stepSubtitle}>
          R{parseFloat(totalAmount).toFixed(2)} among {selectedMembers.length}{" "}
          members
        </Text>

        {/* Split Type Toggle */}
        <View style={styles.splitTypeContainer}>
          <PressableScale
            style={[
              styles.splitTypeButton,
              splitType === "equal" && styles.splitTypeButtonActive,
            ]}
            onPress={() => setSplitType("equal")}
          >
            {splitType === "equal" && (
              <LinearGradient
                colors={Gradients.accent}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Ionicons
              name="apps"
              size={20}
              color={splitType === "equal" ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.splitTypeText,
                splitType === "equal" && styles.splitTypeTextActive,
              ]}
            >
              Equal Split
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.splitTypeButton,
              splitType === "custom" && styles.splitTypeButtonActive,
            ]}
            onPress={() => setSplitType("custom")}
          >
            {splitType === "custom" && (
              <LinearGradient
                colors={Gradients.accent}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Ionicons
              name="create"
              size={20}
              color={splitType === "custom" ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.splitTypeText,
                splitType === "custom" && styles.splitTypeTextActive,
              ]}
            >
              Custom Split
            </Text>
          </PressableScale>
        </View>

        {/* Members Split List */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.splitScroll}
          contentContainerStyle={styles.splitList}
          showsVerticalScrollIndicator={false}
        >
          {selectedMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              style={{
                transform: [
                  {
                    translateX: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
                opacity: scaleAnim,
              }}
            >
              <View style={styles.splitMemberCard}>
                <View style={styles.splitMemberLeft}>
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.splitMemberAvatar}
                  />
                  <View style={styles.splitMemberInfo}>
                    <Text style={styles.splitMemberName}>{member.name}</Text>
                    {splitType === "equal" && (
                      <Text style={styles.splitMemberEqual}>Equal share</Text>
                    )}
                  </View>
                </View>

                <View style={styles.splitMemberRight}>
                  {splitType === "equal" ? (
                    <Text style={styles.splitMemberAmount}>
                      R{member.amount.toFixed(2)}
                    </Text>
                  ) : (
                    <View style={styles.customAmountContainer}>
                      <Text style={styles.customCurrency}>R</Text>
                      <TextInput
                        style={styles.customAmountInput}
                        value={member.amount.toFixed(2)}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateMemberAmount(member.id, val);
                        }}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                      />
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Summary Footer */}
        <BlurView intensity={30} style={styles.splitFooter}>
          <LinearGradient
            colors={["rgba(11, 15, 26, 0.98)", "rgba(15, 19, 26, 0.98)"]}
            style={styles.splitFooterGradient}
          >
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>
                  R{parseFloat(totalAmount).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Allocated</Text>
                <Text style={styles.summaryValue}>
                  R{getTotalAllocated().toFixed(2)}
                </Text>
              </View>
              {Math.abs(getRemaining()) > 0.01 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.remainingLabel]}>
                    {getRemaining() > 0 ? "Remaining" : "Over by"}
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      getRemaining() > 0
                        ? styles.remainingPositive
                        : styles.remainingNegative,
                    ]}
                  >
                    R{Math.abs(getRemaining()).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.stepFooter}>
              <PressableScale
                style={styles.backButton}
                onPress={() => setStep("members")}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={Colors.platinum}
                />
                <Text style={styles.backButtonText}>Back</Text>
              </PressableScale>

              <PressableScale
                style={[
                  styles.confirmButton,
                  !isValidSplit() && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!isValidSplit()}
              >
                <LinearGradient
                  colors={
                    isValidSplit()
                      ? Gradients.accent
                      : ["rgba(128, 128, 128, 0.3)", "rgba(128, 128, 128, 0.3)"]
                  }
                  style={styles.confirmButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.bg}
                  />
                  <Text style={styles.confirmButtonText}>
                    {isValidSplit() ? "Confirm Split" : "Balance Amounts"}
                  </Text>
                </LinearGradient>
              </PressableScale>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </Animated.View>
  );

  const renderSuccessState = () => (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: confettiAnim,
          transform: [
            {
              scale: confettiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.successIcon}>
        <LinearGradient
          colors={["#10B981", "#34D399"]}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark-circle" size={64} color="white" />
        </LinearGradient>
      </View>
      <Text style={styles.successTitle}>Split Complete!</Text>
      <Text style={styles.successSubtitle}>
        R{parseFloat(totalAmount).toFixed(2)} split among{" "}
        {selectedMembers.length} members
      </Text>
    </Animated.View>
  );

  const amountErrorStyle = {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  } as const;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.bg, Colors.bgCard]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.platinum} />
            </PressableScale>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Group Spending</Text>
              <Text style={styles.headerSubtitle}>{clubName}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Step Indicator */}
          {!showSuccess && renderStepIndicator()}

          {/* Content */}
          <View style={styles.content}>
            {showSuccess ? (
              renderSuccessState()
            ) : (
              <>
                {step === "amount" && renderAmountStep()}
                {step === "members" && renderMembersStep()}
                {step === "split" && renderSplitStep()}
              </>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
