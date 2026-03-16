import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import {
  adminLoginSchema,
  adminSignupSchema,
  parseZodErrors,
} from "../../utils/validation";
import { FormGroup, Label } from "../../components/Input";
// AuthInput is a standalone styled.input defined in ./styles — no global Input needed
import { Button } from "../../components/Button";
import {
  PageContainer,
  BrandPanel,
  BrandContent,
  BrandLogoIcon,
  BrandTitle,
  BrandTagline,
  BrandDivider,
  BrandFeatureList,
  BrandFeatureItem,
  FormPanel,
  FormInner,
  FormHeading,
  FormSubheading,
  TabContainer,
  Tab,
  Form,
  AuthInput,
  PasswordWrapper,
  EyeButton,
  ErrorMessage,
  SuccessMessage,
  HelperText,
} from "./styles";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

type TabType = "login" | "signup";

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupClubName, setSignupClubName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
    setErrors({});
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const result = adminLoginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    apiService
      .login(loginEmail, loginPassword)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || "Invalid email or password");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const result = adminSignupSchema.safeParse({
      clubName: signupClubName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    setIsLoading(true);
    apiService
      .signup(signupClubName, signupEmail, signupPassword)
      .then(() => {
        navigate("/setup");
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || "Failed to create account");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <PageContainer>
      {/* ── Left brand panel ── */}
      <BrandPanel>
        <BrandContent>
          <BrandLogoIcon>Z</BrandLogoIcon>
          <BrandTitle>Zonke Clubs</BrandTitle>
          <BrandTagline>
            The complete platform for managing your nightclub, all in one place.
          </BrandTagline>
          <BrandDivider />
          <BrandFeatureList>
            <BrandFeatureItem>
              Manage events &amp; DJ schedules
            </BrandFeatureItem>
            <BrandFeatureItem>
              Club media &amp; content moderation
            </BrandFeatureItem>
            <BrandFeatureItem>
              Real-time analytics &amp; insights
            </BrandFeatureItem>
          </BrandFeatureList>
        </BrandContent>
      </BrandPanel>

      {/* ── Right form panel ── */}
      <FormPanel>
        <FormInner>
          <FormHeading>
            {activeTab === "login" ? "Welcome back" : "Get started"}
          </FormHeading>
          <FormSubheading>
            {activeTab === "login"
              ? "Sign in to your club dashboard"
              : "Create your club admin account"}
          </FormSubheading>

          <TabContainer>
            <Tab
              $active={activeTab === "login"}
              onClick={() => switchTab("login")}
              type="button"
            >
              Login
            </Tab>
            <Tab
              $active={activeTab === "signup"}
              onClick={() => switchTab("signup")}
              type="button"
            >
              Sign Up
            </Tab>
          </TabContainer>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

          {activeTab === "login" ? (
            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label htmlFor="login-email">Email</Label>
                <AuthInput
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    clearError("email");
                  }}
                />
                {errors.email && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </FormGroup>
              <FormGroup>
                <Label htmlFor="login-password">Password</Label>
                <PasswordWrapper>
                  <AuthInput
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      clearError("password");
                    }}
                  />
                  <EyeButton
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showLoginPassword} />
                  </EyeButton>
                </PasswordWrapper>
                {errors.password && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.password}
                  </p>
                )}
              </FormGroup>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Logging in…" : "Login"}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleSignup}>
              <FormGroup>
                <Label htmlFor="signup-clubname">Club Name</Label>
                <AuthInput
                  id="signup-clubname"
                  type="text"
                  placeholder="Enter your club name"
                  value={signupClubName}
                  onChange={(e) => {
                    setSignupClubName(e.target.value);
                    clearError("clubName");
                  }}
                />
                {errors.clubName && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.clubName}
                  </p>
                )}
              </FormGroup>
              <FormGroup>
                <Label htmlFor="signup-email">Email</Label>
                <AuthInput
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    clearError("email");
                  }}
                />
                {errors.email && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </FormGroup>
              <FormGroup>
                <Label htmlFor="signup-password">Password</Label>
                <PasswordWrapper>
                  <AuthInput
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Create a password (min 8 characters)"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      clearError("password");
                    }}
                  />
                  <EyeButton
                    type="button"
                    onClick={() => setShowSignupPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showSignupPassword} />
                  </EyeButton>
                </PasswordWrapper>
                {errors.password && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.password}
                  </p>
                )}
              </FormGroup>
              <FormGroup>
                <Label htmlFor="signup-confirm-password">
                  Confirm Password
                </Label>
                <PasswordWrapper>
                  <AuthInput
                    id="signup-confirm-password"
                    type={showSignupConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      clearError("confirmPassword");
                    }}
                  />
                  <EyeButton
                    type="button"
                    onClick={() => setShowSignupConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showSignupConfirm} />
                  </EyeButton>
                </PasswordWrapper>
                {errors.confirmPassword && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </FormGroup>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>
            </Form>
          )}

          <HelperText>
            {activeTab === "login"
              ? "Don't have an account? Click Sign Up above."
              : "Already have an account? Click Login above."}
          </HelperText>
        </FormInner>
      </FormPanel>
    </PageContainer>
  );
};
