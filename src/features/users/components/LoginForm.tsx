import { AuthLayout } from "@/components/layouts";
import { Button, Input, Alert } from "@/components/ui";
import { useLoginForm } from "../hooks";

type LoginFormProps = {
  onSwitchToSignup: () => void;
};

/**
 * LoginForm Component
 * Uses UI components and custom hook for clean separation (SRP)
 */
export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { values, handleChange, handleSubmit, isLoading, error } =
    useLoginForm();

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back to Kanban Board">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

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
          placeholder="Enter your password"
          disabled={isLoading}
          autoComplete="current-password"
        />

        <Button type="submit" isLoading={isLoading} loadingText="Signing in...">
          Sign In
        </Button>
      </form>

      <div className="my-6 border-t border-slate-200" />

      <p className="text-center text-slate-500 text-sm">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToSignup}
          disabled={isLoading}
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Sign Up
        </button>
      </p>
    </AuthLayout>
  );
}
