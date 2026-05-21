import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { TextStroke } from "../Login/utils";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { Location } from "@/services/locationService";
import postsService from "@/services/postsService";

const alertStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  card: {
    width: "80%",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.15)",
    padding: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(57,243,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    color: Colors.lightGrey,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  okBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  okText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: "700",
  },
});

const VIBE_OPTIONS = [
  { emoji: "💃", name: "Dancing", gradient: ["#FF6B9D", "#C86BFF"] as const },
  {
    emoji: "🎉",
    name: "High Energy",
    gradient: ["#FFA500", "#FF6347"] as const,
  },
  {
    emoji: "✨",
    name: "VIP Lounges",
    gradient: ["#FFD700", "#FFA500"] as const,
  },
  { emoji: "😌", name: "Chilled", gradient: ["#39F3FF", "#00C9FF"] as const },
];

const DRINK_EMOJIS = [
  "🥃",
  "🍾",
  "🍸",
  "🍹",
  "🍺",
  "🍻",
  "🥂",
  "🧃",
  "🧋",
  "🍵",
  "☕",
  "🥤",
];

export default function ProfileSetupScreen() {
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [favoriteDrinks, setFavoriteDrinks] = useState<string[]>([]);
  const [drinkInput, setDrinkInput] = useState("");
  const [selectedDrinkEmoji, setSelectedDrinkEmoji] = useState("🥃");
  const [isSaving, setIsSaving] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const pickImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ImagePicker.requestMediaLibraryPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          setAlertModal({
            title: "Permission Required",
            message: "We need access to your photos to set a profile picture.",
          });
          return Promise.reject("Permission denied");
        }
        return ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      })
      .then((result) => {
        if (!result.canceled) {
          setAvatarUri(result.assets[0].uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      })
      .catch((error) => {
        if (error !== "Permission denied") {
          console.error("Error picking image:", error);
        }
      });
  };

  const toggleVibe = (vibeName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVibes((prev) =>
      prev.includes(vibeName)
        ? prev.filter((v) => v !== vibeName)
        : [...prev, vibeName],
    );
  };

  const addDrink = () => {
    const name = drinkInput.trim();
    if (!name) return;
    const entry = `${selectedDrinkEmoji} ${name}`;
    if (favoriteDrinks.includes(entry)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavoriteDrinks((prev) => [...prev, entry]);
    setDrinkInput("");
  };

  const removeDrink = (entry: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavoriteDrinks((prev) => prev.filter((d) => d !== entry));
  };

  const handleNext = () => {
    if (currentStep === 1 && !avatarUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAlertModal({
        title: "Profile Photo Required",
        message: "Please add a profile photo to continue.",
      });
      return;
    }
    if (currentStep === 1 && !location) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAlertModal({
        title: "Location Required",
        message: "Please select your location to continue.",
      });
      return;
    }
    if (currentStep < totalSteps) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!avatarUri && !location) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAlertModal({
        title: "Required Fields Missing",
        message: "A profile photo and location are required before continuing.",
      });
      return;
    }
    if (!avatarUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAlertModal({
        title: "Profile Photo Required",
        message: "Please add a profile photo before continuing.",
      });
      return;
    }
    if (!location) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAlertModal({
        title: "Location Required",
        message: "Please select your location before continuing.",
      });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaving(true);

    authService
      .updateProfile({ onboarding_complete: true })
      .then(() => refreshUser())
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      })
      .catch((error) => {
        console.error("Skip onboarding failed:", error);
        setAlertModal({
          title: "Error",
          message: "Failed to complete setup. Please try again.",
        });
        setIsSaving(false);
      });
  };

  const handleComplete = () => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Upload avatar to S3 first if it's a local file
    const uploadAvatarIfNeeded = () => {
      if (avatarUri && avatarUri.startsWith("file://")) {
        const extension = avatarUri.toLowerCase().endsWith(".heic")
          ? "jpg"
          : "jpg";
        return postsService
          .uploadMedia({
            uri: avatarUri,
            type: "image",
            name: `avatar_${Date.now()}.${extension}`,
          })
          .then((asset) => {
            return asset.url;
          })
          .catch((error) => {
            console.error("❌ [ProfileSetup] Avatar upload failed:", error);
            throw new Error(
              `Failed to upload avatar: ${error.message || error}`,
            );
          });
      } else {
        return Promise.resolve(avatarUri);
      }
    };

    uploadAvatarIfNeeded()
      .then((uploadedAvatarUrl) => {
        const profileData = {
          bio: bio.trim() || undefined,
          favorite_drinks:
            favoriteDrinks.length > 0 ? favoriteDrinks : undefined,
          location: location || undefined,
          avatar_url: uploadedAvatarUrl || undefined,
          onboarding_complete: true,
        };

        return authService.updateProfile(profileData);
      })
      .then(() => refreshUser())
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      })
      .catch((error) => {
        console.error("❌ [ProfileSetup] Profile update failed:", error);
        const errorMessage =
          error.message || "Failed to save profile. Please try again.";
        setAlertModal({ title: "Error", message: errorMessage });
        setIsSaving(false);
      });
  };

  const progress = (currentStep / totalSteps) * 100;
  const canProceed = currentStep > 1 || (!!avatarUri && !!location);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <View style={styles.headerTop}>
          {currentStep > 1 && (
            <PressableScale onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.primaryBlue}
              />
            </PressableScale>
          )}
          <PressableScale onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </PressableScale>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              entering={FadeInUp.springify()}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </Animated.View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
        {/* Step 1: Bio & Vibes */}
        {currentStep === 1 && (
          <Animated.View
            key="step1"
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify()}
          >
            <View style={styles.stepHeader}>
              <TextStroke stroke={0.6} color={Colors.gold}>
                <Text style={styles.stepTitle}>Tell us about yourself</Text>
              </TextStroke>

              <Text style={styles.stepSubtitle}>
                Help others know you and your vibe.
              </Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
              <PressableScale
                onPress={pickImage}
                style={styles.avatarContainer}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={40}
                      color={Colors.primaryBlue}
                    />
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="pencil" size={16} color={Colors.bg} />
                </View>
              </PressableScale>
              <Text style={styles.avatarLabel}>
                {avatarUri ? "Change Photo" : "Add Profile Photo (Required)"}
              </Text>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["rgba(57,243,255,0.2)", "rgba(200,107,255,0.2)"]}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="person"
                    size={22}
                    color={Colors.primaryBlue}
                  />
                </LinearGradient>
                <Text style={styles.sectionTitle}>About You</Text>
              </View>
              <View style={styles.bioContainer}>
                <TextInput
                  style={styles.bioInput}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  maxLength={200}
                  placeholder="Write a short bio about yourself..."
                  placeholderTextColor={Colors.lightGrey}
                />
                <Text style={styles.charCount}>{bio.length}/200</Text>
              </View>
            </View>

            {/* Vibes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["rgba(255,215,0,0.2)", "rgba(255,165,0,0.2)"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="flash" size={22} color={Colors.gold} />
                </LinearGradient>
                <View style={styles.textArea}>
                  <Text style={styles.sectionTitle}>Your Vibe</Text>
                  <Text style={styles.sectionSubtitle}>
                    What kind of atmosphere do you enjoy?
                  </Text>
                </View>
              </View>

              <View style={styles.vibesGrid}>
                {VIBE_OPTIONS.map((vibe, index) => {
                  const isSelected = selectedVibes.includes(vibe.name);
                  return (
                    <Animated.View
                      key={vibe.name}
                      entering={FadeInDown.delay(100 + index * 50).springify()}
                    >
                      <PressableScale
                        style={[
                          styles.vibeCard,
                          isSelected && styles.vibeCardSelected,
                        ]}
                        onPress={() => toggleVibe(vibe.name)}
                      >
                        {/* {isSelected && (
                          <LinearGradient
                            colors={vibe.gradient}
                            style={styles.vibeCardGradient}
                          />
                        )} */}
                        <View style={styles.vibeCardContent}>
                          <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                          <Text
                            style={[
                              styles.vibeName,
                              isSelected && styles.vibeNameSelected,
                            ]}
                          >
                            {vibe.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={Colors.gold}
                              />
                            </View>
                          )}
                        </View>
                      </PressableScale>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["rgba(57,243,255,0.2)", "rgba(0,201,255,0.2)"]}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="location"
                    size={22}
                    color={Colors.primaryBlue}
                  />
                </LinearGradient>
                <View style={styles.textArea}>
                  <Text style={styles.sectionTitle}>Your Location</Text>
                  <Text style={styles.sectionSubtitle}>
                    Where are you based?
                  </Text>
                </View>
              </View>

              <LocationPicker
                value={location}
                onChange={setLocation}
                placeholder="Search for your location..."
              />
            </View>
          </Animated.View>
        )}

        {/* Step 2: Favorite Drinks */}
        {currentStep === 2 && (
          <Animated.View
            key="step2"
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify()}
          >
            <View style={styles.stepHeader}>
              <TextStroke stroke={0.6} color={Colors.gold}>
                <Text style={styles.stepTitle}>What's your go-to drink?</Text>
              </TextStroke>

              <Text style={styles.stepSubtitle}>
                Select your favorites to personalize your experience
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["rgba(147,51,234,0.2)", "rgba(219,39,119,0.2)"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="wine" size={22} color="#C86BFF" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Favorite Drinks</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Add your own drinks and pick an icon
              </Text>

              {/* Emoji picker */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                {DRINK_EMOJIS.map((emoji) => (
                  <PressableScale
                    key={emoji}
                    onPress={() => {
                      setSelectedDrinkEmoji(emoji);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        selectedDrinkEmoji === emoji
                          ? "rgba(212,175,55,0.25)"
                          : "rgba(255,255,255,0.05)",
                      borderWidth: selectedDrinkEmoji === emoji ? 1.5 : 1,
                      borderColor:
                        selectedDrinkEmoji === emoji
                          ? Colors.gold
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                  </PressableScale>
                ))}
              </View>

              {/* Text input + Add button */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {selectedDrinkEmoji}
                  </Text>
                  <TextInput
                    value={drinkInput}
                    onChangeText={setDrinkInput}
                    placeholder="e.g. Black Label, Mojito..."
                    placeholderTextColor={Colors.lightGrey}
                    style={{
                      flex: 1,
                      color: Colors.white,
                      fontSize: 15,
                      paddingVertical: 13,
                    }}
                    onSubmitEditing={addDrink}
                    returnKeyType="done"
                    autoCapitalize="words"
                  />
                </View>
                <PressableScale
                  onPress={addDrink}
                  disabled={!drinkInput.trim()}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: drinkInput.trim()
                      ? Colors.gold
                      : "rgba(212,175,55,0.2)",
                    alignSelf: "center",
                  }}
                >
                  <Ionicons
                    name="add"
                    size={26}
                    color={drinkInput.trim() ? Colors.bg : Colors.smoke}
                  />
                </PressableScale>
              </View>

              {/* Added drinks chips */}
              {favoriteDrinks.length > 0 && (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {favoriteDrinks.map((entry) => (
                    <Animated.View
                      key={entry}
                      entering={FadeInDown.springify()}
                    >
                      <PressableScale
                        onPress={() => removeDrink(entry)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 99,
                          backgroundColor: "rgba(212,175,55,0.15)",
                          borderWidth: 1,
                          borderColor: "rgba(212,175,55,0.4)",
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>
                          {entry.split(" ")[0]}
                        </Text>
                        <Text
                          style={{
                            color: Colors.gold,
                            fontSize: 14,
                            fontWeight: "600",
                          }}
                        >
                          {entry.split(" ").slice(1).join(" ")}
                        </Text>
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={Colors.gold}
                        />
                      </PressableScale>
                    </Animated.View>
                  ))}
                </View>
              )}

              {favoriteDrinks.length === 0 && (
                <Text
                  style={{
                    color: Colors.smoke,
                    fontSize: 13,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  No drinks added yet — type one above and hit +
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>

      {/* Alert Modal */}
      {alertModal && (
        <View style={alertStyles.overlay}>
          <View style={alertStyles.card}>
            <View style={alertStyles.iconWrap}>
              <Ionicons
                name="information-circle-outline"
                size={28}
                color={Colors.primaryBlue}
              />
            </View>
            <Text style={alertStyles.title}>{alertModal.title}</Text>
            <Text style={alertStyles.body}>{alertModal.message}</Text>
            <Pressable
              style={alertStyles.okBtn}
              onPress={() => setAlertModal(null)}
            >
              <Text style={alertStyles.okText}>OK</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Next/Complete Button */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.footer}
      >
        <PressableScale
          style={[
            styles.nextButton,
            (!canProceed || isSaving) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.bg} />
          ) : (
            <>
              <Text
                style={[
                  styles.nextButtonText,
                  !canProceed && styles.nextButtonTextDisabled,
                ]}
              >
                {currentStep === totalSteps ? "Complete Setup" : "Next"}
              </Text>
              <Ionicons
                name={
                  currentStep === totalSteps
                    ? "checkmark-circle"
                    : "arrow-forward"
                }
                size={22}
                color={canProceed ? Colors.bg : Colors.lightGrey}
              />
            </>
          )}
        </PressableScale>
      </Animated.View>
    </SafeAreaView>
  );
}
