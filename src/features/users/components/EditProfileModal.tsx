import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks";
import { Modal, Input, Button, Alert } from "@/components/ui";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * EditProfileModal Component
 * Modal for editing user profile (display name and photo URL)
 */
export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!displayName.trim()) {
      setLocalError("Display name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;
  const isDisabled = isSubmitting || isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && <Alert variant="error">{displayError}</Alert>}

        <Input
          label="Display Name"
          type="text"
          id="editDisplayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          disabled={isDisabled}
        />

        <div>
          <Input
            label="Photo URL (optional)"
            type="url"
            id="editPhotoURL"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            disabled={isDisabled}
          />
          <p className="mt-1 text-xs text-slate-500">
            Enter a URL to an image for your profile picture
          </p>
        </div>

        {photoURL && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600">Preview:</span>
            <img
              src={photoURL}
              alt="Preview"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDisabled}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
