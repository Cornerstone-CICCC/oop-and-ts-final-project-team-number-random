import { type ReactNode, useEffect } from "react";
import { cn } from "@/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {title && (
          <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

type ConfirmModalVariant = "danger" | "warning" | "default";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const confirmVariantStyles: Record<ConfirmModalVariant, string> = {
  danger: "bg-red-600 hover:bg-red-700 text-white",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  default: "bg-indigo-600 hover:bg-indigo-700 text-white",
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-slate-600 mb-6">{message}</p>
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 shadow-sm rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg disabled:opacity-50 transition-colors",
            confirmVariantStyles[variant]
          )}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
