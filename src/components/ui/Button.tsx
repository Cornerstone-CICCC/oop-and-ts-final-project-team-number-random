import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500 focus:ring-offset-white",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow focus:ring-slate-500 focus:ring-offset-white",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500 focus:ring-offset-white",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-500 focus:ring-offset-white",
};

export function Button({
  variant = "primary",
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "w-full py-3 px-4 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all active:scale-[0.98]",
        variantStyles[variant],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}
