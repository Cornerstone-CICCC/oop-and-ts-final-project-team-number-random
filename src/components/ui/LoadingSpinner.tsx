type LoadingSpinnerProps = {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-4 h-4 border",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-2",
};

export function LoadingSpinner({
  fullScreen = false,
  size = "md",
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`${sizeClasses[size]} border-slate-200 border-t-indigo-600 rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
