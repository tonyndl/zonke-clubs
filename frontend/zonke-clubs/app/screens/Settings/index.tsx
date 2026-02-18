import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../Login/utils";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Account info state
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const hasAccountChanges = () => {
    return (
      username !== user?.username ||
      email !== (user?.email || "") ||
      phone !== (user?.phone || "")
    );
  };

  const handleSaveAccount = () => {
    if (!hasAccountChanges()) {
      setIsEditing(false);
      return;
    }

    // Validation
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    if (email.trim() && !/^[^\s]+@[^\s]+$/.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    const accountData: any = {};
    if (username.trim() !== user?.username)
      accountData.username = username.trim();
    if (email.trim() !== (user?.email || ""))
      accountData.email = email.trim() || null;
    if (phone.trim() !== (user?.phone || ""))
      accountData.phone = phone.trim() || null;

    authService
      .updateAccountInfo(accountData)
      .then(() => refreshUser())
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Account information updated successfully!");
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Account update failed:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errorMessage =
          typeof error.message === "string"
            ? error.message
            : "Failed to update account information.";
        Alert.alert("Error", errorMessage);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password",
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    authService
      .changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Password changed successfully!");

        // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordSection(false);
      })
      .catch((error) => {
        console.error("Password change failed:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Error",
          error.message ||
            "Failed to change password. Please check your current password.",
        );
      });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout()
            .then(() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              // Auth state change will automatically show login screen
            })
            .catch((error) => {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout");
            });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              "Coming Soon",
              "Account deletion will be available soon",
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
        {/* Header with Back Button and Centered Title */}
        <View style={styles.headerContainer}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={styles.backButtonContainer}
          >
            <PressableScale
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.gold} />
            </PressableScale>
          </Animated.View>
          <Animated.View
            entering={FadeInUp.delay(50).springify()}
            style={styles.titleContainer}
          >
            <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
              <Text style={styles.screenTitle}>Settings</Text>
            </TextStroke>
          </Animated.View>
        </View>

        {/* Account Information Section */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <LinearGradient
                colors={["rgba(57,243,255,0.2)", "rgba(200,107,255,0.2)"]}
                style={styles.iconGradient}
              >
                <Ionicons name="person" size={20} color={Colors.primaryBlue} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>
            {!isEditing && (
              <PressableScale
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={20} color={Colors.gold} />
              </PressableScale>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={username}
                onChangeText={setUsername}
                editable={isEditing}
                placeholder="Username"
                placeholderTextColor={Colors.lightGrey}
                autoCapitalize="none"
              />
            </View>

            {isEditing && (
              <View style={styles.actionButtons}>
                <PressableScale
                  onPress={() => {
                    setUsername(user?.username || "");
                    setEmail(user?.email || "");
                    setPhone(user?.phone || "");
                    setIsEditing(false);
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </PressableScale>
                <PressableScale
                  onPress={handleSaveAccount}
                  style={styles.saveButton}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={Colors.bg} />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color={Colors.bg} />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </PressableScale>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Security Section */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <LinearGradient
                colors={["rgba(255,215,0,0.2)", "rgba(255,140,0,0.2)"]}
                style={styles.iconGradient}
              >
                <Ionicons name="lock-closed" size={20} color={Colors.gold} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Security</Text>
            </View>
          </View>

          <View style={styles.card}>
            <PressableScale
              onPress={() => setShowPasswordSection(!showPasswordSection)}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="key" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Ionicons
                name={showPasswordSection ? "chevron-up" : "chevron-forward"}
                size={20}
                color={Colors.lightGrey}
              />
            </PressableScale>

            {showPasswordSection && (
              <Animated.View
                entering={FadeInDown.springify()}
                style={styles.passwordSection}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={Colors.lightGrey}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showCurrentPassword ? "eye-off" : "eye"}
                        size={20}
                        color={Colors.lightGrey}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.lightGrey}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showNewPassword ? "eye-off" : "eye"}
                        size={20}
                        color={Colors.lightGrey}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={Colors.lightGrey}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color={Colors.lightGrey}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <PressableScale
                  onPress={handleChangePassword}
                  style={styles.changePasswordButton}
                >
                  <Text style={styles.changePasswordButtonText}>
                    Update Password
                  </Text>
                </PressableScale>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <LinearGradient
                colors={["rgba(200,107,255,0.2)", "rgba(139,69,255,0.2)"]}
                style={styles.iconGradient}
              >
                <Ionicons
                  name="settings"
                  size={20}
                  color={Colors.secondaryBlue}
                />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={Colors.primaryBlue}
                />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: Colors.bgCard, true: Colors.gold }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: Colors.bgCard, true: Colors.gold }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="location"
                  size={20}
                  color={Colors.primaryBlue}
                />
                <Text style={styles.settingText}>Location Services</Text>
              </View>
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: Colors.bgCard, true: Colors.gold }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </Animated.View>

        {/* Support Section */}
        {/* <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <LinearGradient
                colors={['rgba(57,243,255,0.2)', 'rgba(0,191,255,0.2)']}
                style={styles.iconGradient}
              >
                <Ionicons name="help-circle" size={20} color={Colors.primaryBlue} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Support</Text>
            </View>
          </View>

          <View style={styles.card}>
            <PressableScale
              onPress={() => Alert.alert('Help & Support', 'Coming soon!')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="help-buoy" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale
              onPress={() => Alert.alert('Terms & Conditions', 'Coming soon!')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="document-text" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale
              onPress={() => Alert.alert('Privacy Policy', 'Coming soon!')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale
              onPress={() => Alert.alert('About', 'Zonke Clubs v1.0.0\n\nYour nightlife companion')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle" size={20} color={Colors.primaryBlue} />
                <Text style={styles.settingText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
            </PressableScale>
          </View>
        </Animated.View> */}

        {/* Exit Section */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <LinearGradient
                colors={["rgba(255,69,58,0.2)", "rgba(255,59,48,0.2)"]}
                style={styles.iconGradient}
              >
                <Ionicons name="power" size={20} color="#ff3b30" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Exit</Text>
            </View>
          </View>

          <View style={styles.card}>
            <PressableScale onPress={handleLogout} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="log-out" size={20} color={Colors.gold} />
                <Text style={styles.settingText}>Logout</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.lightGrey}
              />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale
              onPress={handleDeleteAccount}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash" size={20} color="#ff3b30" />
                <Text style={[styles.settingText, styles.dangerText]}>
                  Delete Account
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.lightGrey}
              />
            </PressableScale>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    position: "relative",
    marginBottom: 20,
  },
  backButtonContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  backButton: {
    margin: "auto",
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 35,
    fontWeight: "800",
    letterSpacing: 1.6,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gold,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lightGrey,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lightGrey,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.gold,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
  },
  dangerText: {
    color: "#ff3b30",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 4,
  },
  passwordSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: Colors.white,
  },
  eyeButton: {
    padding: 14,
  },
  changePasswordButton: {
    backgroundColor: Colors.gold,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
  bottomSpacer: {
    height: 40,
  },
});
