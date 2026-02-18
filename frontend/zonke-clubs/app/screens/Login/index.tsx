import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { TextStroke } from "./utils";

import Svg, { Polygon } from "react-native-svg";
import { router } from "expo-router";
import { Colors } from "@/constants/ui";
import { styles } from "./styles";
import { useAuth } from "@/contexts/AuthContext";

const HorizontalSlantParallelogram = () => {
  const points = "54,10 110,100 110,270 54,190";

  return (
    <Svg width="60" height="200">
      <Polygon
        points={points}
        fill="rgba(57, 243, 255, 0.9)"
        stroke="black"
        strokeWidth="2"
      />
    </Svg>
  );
};

interface InputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const Input = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  autoCapitalize = "none",
  keyboardType = "default",
  showPassword,
  onTogglePassword,
}: InputProps) => {
  return (
    <LinearGradient
      colors={["rgba(57,243,255,0.6)", "rgba(200,107,255,0.6)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.inputBorder}
    >
      <View style={styles.inputInnerContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          secureTextEntry={secureTextEntry && !showPassword}
          style={[styles.input, secureTextEntry && { paddingRight: 45 }]}
          autoComplete="off"
          textContentType="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
        {secureTextEntry && onTogglePassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={Colors.lightGrey}
            />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

export const AuthScreen = () => {
  const { login: authLogin, register: authRegister } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    authLogin({ username: username.trim(), password })
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch((error) => {
        Alert.alert("Login Failed", error.message || "Invalid credentials");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    authRegister({
      username: username.trim(),
      email: email.trim() || undefined,
      password,
      role: "club_goer",
    })
      .then((result) => {
        // Navigate to profile setup for new users
        if (result.needsSetup) {
          router.replace("/screens/ProfileSetup");
        } else {
          router.replace("/(tabs)");
        }
      })
      .catch((error) => {
        Alert.alert("Registration Failed", error.message || "Please try again");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear fields when switching
    setUsername("");
    setPassword("");
    setEmail("");
    setConfirmPassword("");
    // Reset password visibility
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 18 }}>
            <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
              <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>
            </TextStroke>
          </View>

          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          {!isLogin && (
            <Input
              placeholder="Email (optional)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          )}

          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {!isLogin && (
            <Input
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
          )}

          <View
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              transform: [{ translateX: -55.4 }],
            }}
          >
            <HorizontalSlantParallelogram />
          </View>

          <View style={{ position: "absolute", bottom: 50, right: 0 }}>
            <HorizontalSlantParallelogram />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Log In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && <Text style={styles.linkSmall}>Forgot Password?</Text>}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={toggleMode}
              activeOpacity={0.6}
              disabled={isLoading}
            >
              <Text style={styles.link}>{isLogin ? "Sign Up" : "Log In"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
