import { type InputHTMLAttributes } from "react";
import { cn } from "@/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({
  label,
  error,
  id,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full px-4 py-3 bg-white border border-slate-300 rounded-lg",
          "text-slate-900 placeholder-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
          "shadow-sm transition-all",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
