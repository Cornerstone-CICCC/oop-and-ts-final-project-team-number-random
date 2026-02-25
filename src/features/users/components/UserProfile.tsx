import { useState } from "react";
import { useAuth } from "@/hooks";
import { formatDate } from "@/utils";
import { EditProfileModal } from "./EditProfileModal";
import { Button, Alert, ConfirmModal } from "@/components/ui";

/**
 * UserProfile Component
 * Displays the current user's profile with edit and logout options
 */
export function UserProfile() {
  const { user, signOut, deleteAccount, isLoading, error } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Error is handled by AuthContext
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      // Error is handled by AuthContext
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user.displayName}
            </h2>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-3 mb-6 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Member since:</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Last login:</span>
            <span>{formatDate(user.lastLoginAt)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => setShowEditModal(true)}
            disabled={isLoading}
          >
            Edit Profile
          </Button>

          <Button
            variant="secondary"
            onClick={handleSignOut}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Signing out..."
          >
            Sign Out
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="text-red-700 hover:bg-red-50"
          >
            Delete Account
          </Button>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account?"
        message="This action cannot be undone. All your data will be permanently deleted."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
