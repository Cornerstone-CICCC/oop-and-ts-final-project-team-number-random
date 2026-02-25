import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

/**
 * AuthPage Component
 * Handles switching between login and signup forms
 */
export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  if (isLogin) {
    return <LoginForm onSwitchToSignup={() => setIsLogin(false)} />;
  }

  return <SignupForm onSwitchToLogin={() => setIsLogin(true)} />;
}
