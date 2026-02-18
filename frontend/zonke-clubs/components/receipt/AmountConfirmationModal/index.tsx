import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { BlurView } from "expo-blur";
import { styles } from "./styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  onSkipSplit: () => void;
  initialAmount: number;
};

export function AmountConfirmationModal({
  visible,
  onClose,
  onConfirm,
  onSkipSplit,
  initialAmount,
}: Props) {
  const [amount, setAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount(initialAmount > 0 ? initialAmount.toString() : "");
      setIsEditing(initialAmount === 0);
    }
  }, [visible, initialAmount]);

  const handleConfirm = () => {
    const finalAmount = parseFloat(amount);
    if (!isNaN(finalAmount) && finalAmount > 0) {
      onConfirm(finalAmount);
    }
  };

  const handleQuickAmount = (value: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "R0.00" : `R${num.toFixed(2)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <BlurView intensity={20} style={styles.backdropBlur} />
        </TouchableOpacity>

        <View style={styles.modal}>
          <LinearGradient
            colors={["rgba(26, 30, 42, 0.98)", "rgba(11, 15, 26, 0.98)"]}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={[Colors.gold, Colors.goldLight]}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="cash" size={24} color={Colors.bgCard} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Confirm Amount</Text>
                <Text style={styles.subtitle}>
                  {initialAmount > 0
                    ? "Review the detected total"
                    : "Enter the receipt total"}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Amount Display */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <TouchableOpacity
                  style={styles.amountDisplay}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[
                      "rgba(57, 243, 255, 0.15)",
                      "rgba(57, 243, 255, 0.05)",
                    ]}
                    style={styles.amountDisplayGradient}
                  >
                    {isEditing ? (
                      <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>R</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={amount}
                          onChangeText={setAmount}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={Colors.smoke}
                          autoFocus
                          selectTextOnFocus
                        />
                      </View>
                    ) : (
                      <View style={styles.amountViewContainer}>
                        <Text style={styles.amountText}>
                          {formatCurrency(amount)}
                        </Text>
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={Colors.gold}
                        />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Quick Add Buttons */}
              <View style={styles.quickAddSection}>
                <Text style={styles.quickAddLabel}>Quick Add</Text>
                <View style={styles.quickAddButtons}>
                  {[10, 20, 50, 100].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.quickAddButton}
                      onPress={() => handleQuickAmount(value)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(57, 243, 255, 0.1)",
                          "rgba(57, 243, 255, 0.05)",
                        ]}
                        style={styles.quickAddButtonGradient}
                      >
                        <Text style={styles.quickAddButtonText}>+R{value}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={Colors.gold}
                  />
                </View>
                <Text style={styles.infoText}>
                  This amount will be added to your spending tracker. You can
                  split it with friends in the next step.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleConfirm}
                  disabled={!amount || parseFloat(amount) <= 0}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      amount && parseFloat(amount) > 0
                        ? [Colors.gold, Colors.goldLight]
                        : ["rgba(57, 243, 255, 0.3)", "rgba(57, 243, 255, 0.2)"]
                    }
                    style={styles.primaryButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        (!amount || parseFloat(amount) <= 0) &&
                          styles.primaryButtonTextDisabled,
                      ]}
                    >
                      Continue to Split
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={
                        amount && parseFloat(amount) > 0
                          ? Colors.bgCard
                          : Colors.smoke
                      }
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onSkipSplit}
                  disabled={!amount || parseFloat(amount) <= 0}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      (!amount || parseFloat(amount) <= 0) &&
                        styles.secondaryButtonTextDisabled,
                    ]}
                  >
                    Skip Split - Just Track
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={Colors.smoke} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
