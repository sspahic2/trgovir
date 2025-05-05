'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PrettyModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function PrettyModal({ isOpen, onClose, children, title }: PrettyModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (typeof window === 'undefined' || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl w-full max-w-md">
        {title && (
          <h2 className="text-lg font-semibold mb-4 text-center">
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
