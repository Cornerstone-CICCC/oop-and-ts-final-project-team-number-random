import { useCallback } from "react";
import { useAuth } from "@/hooks";
import { useForm } from "@/hooks/useForm";

type SignupFormValues = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Validation function for signup form
 */
function validateSignupForm(
  values: SignupFormValues,
): Partial<Record<keyof SignupFormValues, string>> {
  const errors: Partial<Record<keyof SignupFormValues, string>> = {};

  if (!values.displayName.trim()) {
    errors.displayName = "Name is required";
  } else if (values.displayName.trim().length < 2) {
    errors.displayName = "Name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email format";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function useSignupForm(onSuccess?: () => void) {
  const { signUp, clearError, error: authError, isLoading } = useAuth();

  const form = useForm<SignupFormValues>({
    initialValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: validateSignupForm,
    onSubmit: async (values) => {
      clearError();
      try {
        await signUp({
          displayName: values.displayName.trim(),
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
