import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { BlurView } from "expo-blur";
import { styles } from "./styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  splitData: any;
};

export function SplitSuccessModal({ visible, onClose, splitData }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!splitData) return null;

  const { totalAmount, myShare, splits, splitEqually } = splitData;
  const hasSplits = splits && splits.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={30} style={styles.backdropBlur} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(26, 30, 42, 0.98)", "rgba(11, 15, 26, 0.98)"]}
            style={styles.modalGradient}
          >
            {/* Success Icon */}
            <View style={styles.iconSection}>
              <View style={styles.iconOuter}>
                <LinearGradient
                  colors={["#10B981", "#34D399", "#6EE7B7"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="checkmark-circle" size={80} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.confettiContainer}>
                {[...Array(6)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.confetti,
                      {
                        left: `${15 + i * 15}%`,
                        backgroundColor:
                          i % 3 === 0
                            ? Colors.gold
                            : i % 3 === 1
                              ? "#10B981"
                              : "#60A5FA",
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {hasSplits ? "Split Complete!" : "Spending Tracked!"}
            </Text>
            <Text style={styles.subtitle}>
              {hasSplits
                ? "Your bill has been split successfully"
                : "Amount added to your spending tracker"}
            </Text>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={[
                  "rgba(57, 243, 255, 0.15)",
                  "rgba(57, 243, 255, 0.05)",
                ]}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryHeader}>
                  <Ionicons name="receipt" size={24} color={Colors.gold} />
                  <Text style={styles.summaryTitle}>Receipt Summary</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Bill</Text>
                  <Text style={styles.summaryValue}>
                    R{totalAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelHighlight}>Your Share</Text>
                  <Text style={styles.summaryValueHighlight}>
                    R{myShare.toFixed(2)}
                  </Text>
                </View>

                {hasSplits && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.splitsSection}>
                      <Text style={styles.splitsHeader}>
                        Split with {splits.length}{" "}
                        {splits.length === 1 ? "person" : "people"}
                      </Text>
                      {splits.map((split: any, index: number) => (
                        <View key={split.friendId} style={styles.splitRow}>
                          <View style={styles.splitLeft}>
                            <View style={styles.splitAvatar}>
                              <Text style={styles.splitAvatarText}>
                                {split.friendName.charAt(0)}
                              </Text>
                            </View>
                            <Text style={styles.splitName}>
                              {split.friendName}
                            </Text>
                          </View>
                          <Text style={styles.splitAmount}>
                            R{split.amount.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>

            {/* Info Cards */}
            <ScrollView
              style={styles.infoSection}
              showsVerticalScrollIndicator={false}
            >
              {hasSplits && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="send" size={20} color={Colors.gold} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Requests Sent</Text>
                    <Text style={styles.infoDescription}>
                      Payment requests have been sent to your friends
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="stats-chart" size={20} color={Colors.gold} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Updated Statistics</Text>
                  <Text style={styles.infoDescription}>
                    Your spending has been tracked and added to your profile
                  </Text>
                </View>
              </View>

              {hasSplits && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name="notifications"
                      size={20}
                      color={Colors.gold}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Get Notified</Text>
                    <Text style={styles.infoDescription}>
                      You'll be notified when friends confirm their payments
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.gold, Colors.goldLight]}
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                  <Ionicons name="checkmark" size={24} color={Colors.bgCard} />
                </LinearGradient>
              </TouchableOpacity>

              {hasSplits && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={Colors.gold}
                  />
                  <Text style={styles.secondaryButtonText}>Share Receipt</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
