"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteDataModal({ isOpen, onClose }: DeleteDataModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete all data" size="sm">
      <div className="space-y-6">
        <p className="text-muted">
          This will permanently remove all your health information from this device.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-warning text-white hover:bg-warning/90 border-transparent">
            Delete everything
          </Button>
        </div>
      </div>
    </Modal>
  );
}
