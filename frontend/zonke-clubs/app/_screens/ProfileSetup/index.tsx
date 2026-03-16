import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
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
  {
    emoji: "🎵",
    name: "Live Music",
    gradient: ["#39F3FF", "#0099FF"] as const,
  },
  {
    emoji: "🍸",
    name: "Cocktail Bars",
    gradient: ["#C86BFF", "#9B51E0"] as const,
  },
  { emoji: "🌆", name: "Rooftop", gradient: ["#39F3FF", "#00C9FF"] as const },
];

const DRINK_SUGGESTIONS = [
  { name: "Black Label", emoji: "🥃" },
  { name: "Hennessy", emoji: "🍾" },
  { name: "Jameson", emoji: "🥃" },
  { name: "Champagne", emoji: "🍾" },
  { name: "Vodka", emoji: "🍸" },
  { name: "Gin & Tonic", emoji: "🍸" },
  { name: "Whiskey", emoji: "🥃" },
  { name: "Tequila", emoji: "🍹" },
  { name: "Mojito", emoji: "🍹" },
  { name: "Beer", emoji: "🍺" },
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
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ImagePicker.requestMediaLibraryPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "We need access to your photos to set a profile picture.",
          );
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

  const toggleDrink = (drink: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavoriteDrinks((prev) =>
      prev.includes(drink) ? prev.filter((d) => d !== drink) : [...prev, drink],
    );
  };

  const handleNext = () => {
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
        Alert.alert("Error", "Failed to complete setup. Please try again.");
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
          vibes: selectedVibes.length > 0 ? selectedVibes : undefined,
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
        Alert.alert("Error", errorMessage);
        setIsSaving(false);
      });
  };

  const progress = (currentStep / totalSteps) * 100;
  // Allow proceeding through all steps without requiring any data
  const canProceed = true;

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
              <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
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
              <Text style={styles.avatarLabel}>Add Profile Photo</Text>
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
                <Text style={styles.sectionTitle}>Your Vibe</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                What kind of atmosphere do you enjoy?
              </Text>
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
                <Text style={styles.sectionTitle}>Your Location</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Where are you based? (Optional)
              </Text>
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
              <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
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
                Tap to select your preferences
              </Text>

              <View style={styles.drinksGrid}>
                {DRINK_SUGGESTIONS.map((drink, index) => {
                  const isSelected = favoriteDrinks.includes(drink.name);
                  return (
                    <Animated.View
                      key={drink.name}
                      entering={FadeInDown.delay(100 + index * 40).springify()}
                    >
                      <PressableScale
                        style={[
                          styles.drinkCard,
                          isSelected && styles.drinkCardSelected,
                        ]}
                        onPress={() => toggleDrink(drink.name)}
                      >
                        <Text style={styles.drinkEmoji}>{drink.emoji}</Text>
                        <Text
                          style={[
                            styles.drinkName,
                            isSelected && styles.drinkNameSelected,
                          ]}
                        >
                          {drink.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmarkSmall}>
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={Colors.gold}
                            />
                          </View>
                        )}
                      </PressableScale>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>

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
