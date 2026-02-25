import { useCallback } from "react";
import { useAuth } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import type { LoginCredentials } from "@/types";

/**
 * Validation function for login form
 */
function validateLoginForm(
  values: LoginCredentials,
): Partial<Record<keyof LoginCredentials, string>> {
  const errors: Partial<Record<keyof LoginCredentials, string>> = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email format";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

/**
 * useLoginForm Hook
 * Encapsulates login form logic (SRP - Single Responsibility)
 */
export function useLoginForm(onSuccess?: () => void) {
  const { signIn, clearError, error: authError, isLoading } = useAuth();

  const form = useForm<LoginCredentials>({
    initialValues: { email: "", password: "" },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      clearError();
      try {
        await signIn({
          email: values.email.trim(),
          password: values.password,
        });
        onSuccess?.();
      } catch {
        // Error is handled by AuthContext
      }
    },
  });

  const clearErrors = useCallback(() => {
    clearError();
    form.reset();
  }, [clearError, form]);

  return {
    ...form,
    isLoading,
    error: Object.values(form.errors)[0] || authError,
    clearErrors,
  };
}
