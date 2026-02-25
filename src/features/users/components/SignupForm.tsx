import { AuthLayout } from "@/components/layouts";
import { Button, Input, Alert } from "@/components/ui";
import { useSignupForm } from "../hooks";

type SignupFormProps = {
  onSwitchToLogin: () => void;
};

/**
 * SignupForm Component
 * Uses UI components and custom hook for clean separation (SRP)
 */
export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { values, handleChange, handleSubmit, isLoading, error } =
    useSignupForm();

  return (
    <AuthLayout title="Create Account" subtitle="Get started with Kanban Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="Name"
          type="text"
          id="displayName"
          value={values.displayName}
          onChange={handleChange("displayName")}
          placeholder="Your name"
          disabled={isLoading}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          id="email"
          value={values.email}
          onChange={handleChange("email")}
          placeholder="you@example.com"
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          id="password"
          value={values.password}
          onChange={handleChange("password")}
          placeholder="At least 6 characters"
          disabled={isLoading}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="Repeat your password"
          disabled={isLoading}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Creating account..."
        >
          Create Account
        </Button>
      </form>

      <div className="my-6 border-t border-slate-200" />

      <p className="text-center text-slate-500 text-sm">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Sign In
        </button>
      </p>
    </AuthLayout>
  );
}
