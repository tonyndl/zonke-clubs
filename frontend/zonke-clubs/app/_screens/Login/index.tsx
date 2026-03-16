import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
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
import {
  loginSchema,
  registerSchema,
  parseZodErrors,
} from "@/utils/validation";

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
  style?: object;
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
  style,
}: InputProps) => {
  return (
    <LinearGradient
      colors={["rgba(57,243,255,0.6)", "rgba(200,107,255,0.6)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.inputBorder, style]}
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

const errorTextStyle = {
  color: "#ff6b6b",
  fontSize: 12,
  marginTop: 2,
  marginBottom: 10,
  marginLeft: 2,
} as const;

const inputWithErrorStyle = { marginBottom: 2 } as const;

export const AuthScreen = () => {
  const { login: authLogin, register: authRegister } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showError = (title: string, message: string) =>
    setErrorModal({ visible: true, title, message });

  const handleLogin = () => {
    const result = loginSchema.safeParse({
      username: username.trim(),
      password,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    authLogin({ username: username.trim(), password })
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch((error) => {
        showError("Login Failed", error.message || "Invalid credentials");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRegister = () => {
    const result = registerSchema.safeParse({
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
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
        showError("Registration Failed", error.message || "Please try again");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setEmail("");
    setConfirmPassword("");
    setErrors({});
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

          <View style={errors.username && styles.inputContainer}>
            <Input
              placeholder="Username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                clearError("username");
              }}
              style={errors.username ? inputWithErrorStyle : undefined}
            />
            {!!errors.username && (
              <Text style={errorTextStyle}>{errors.username}</Text>
            )}
          </View>

          {!isLogin && (
            <View style={errors.email && styles.inputContainer}>
              <Input
                placeholder="Email (optional)"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  clearError("email");
                }}
                keyboardType="email-address"
                style={errors.email ? inputWithErrorStyle : undefined}
              />
              {!!errors.email && (
                <Text style={errorTextStyle}>{errors.email}</Text>
              )}
            </View>
          )}

          <View style={errors.password && styles.inputContainer}>
            <Input
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError("password");
              }}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              style={errors.password ? inputWithErrorStyle : undefined}
            />
            {!!errors.password && (
              <Text style={errorTextStyle}>{errors.password}</Text>
            )}
          </View>

          {!isLogin && (
            <View style={errors.confirmPassword && styles.inputContainer}>
              <Input
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  clearError("confirmPassword");
                }}
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={errors.confirmPassword ? inputWithErrorStyle : undefined}
              />
              {!!errors.confirmPassword && (
                <Text style={errorTextStyle}>{errors.confirmPassword}</Text>
              )}
            </View>
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

      {/* Error modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal((p) => ({ ...p, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={["rgba(255,107,107,0.2)", "rgba(255,59,48,0.1)"]}
              style={styles.modalIconGradient}
            >
              <Ionicons name="alert-circle-outline" size={28} color="#ff6b6b" />
            </LinearGradient>
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalOkButton}
              onPress={() => setErrorModal((p) => ({ ...p, visible: false }))}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
