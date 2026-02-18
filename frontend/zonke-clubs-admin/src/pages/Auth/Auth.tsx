import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { Input, FormGroup, Label } from "../../components/Input";
import { Button } from "../../components/Button";
import {
  PageContainer,
  AuthCard,
  Logo,
  LogoIcon,
  LogoText,
  LogoSubtext,
  TabContainer,
  Tab,
  Form,
  ErrorMessage,
  SuccessMessage,
  HelperText,
} from "./styles";

type TabType = "login" | "signup";

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupClubName, setSignupClubName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields");
      return;
    }

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

    if (
      !signupClubName ||
      !signupEmail ||
      !signupPassword ||
      !signupConfirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

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
      <AuthCard>
        <Logo>
          <LogoIcon>Z</LogoIcon>
          <LogoText>Zonke Clubs</LogoText>
          <LogoSubtext>Club Admin Portal</LogoSubtext>
        </Logo>

        <TabContainer>
          <Tab
            $active={activeTab === "login"}
            onClick={() => {
              setActiveTab("login");
              setError("");
              setSuccessMessage("");
            }}
            type="button"
          >
            Login
          </Tab>
          <Tab
            $active={activeTab === "signup"}
            onClick={() => {
              setActiveTab("signup");
              setError("");
              setSuccessMessage("");
            }}
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
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </FormGroup>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleSignup}>
            <FormGroup>
              <Label htmlFor="signup-clubname">Club Name</Label>
              <Input
                id="signup-clubname"
                type="text"
                placeholder="Enter your club name"
                value={signupClubName}
                onChange={(e) => setSignupClubName(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                required
              />
            </FormGroup>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </Form>
        )}

        <HelperText>
          {activeTab === "login"
            ? "Don't have an account? Click Sign Up above."
            : "Already have an account? Click Login above."}
        </HelperText>
      </AuthCard>
    </PageContainer>
  );
};
