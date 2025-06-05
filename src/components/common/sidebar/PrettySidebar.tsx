`use client`

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PrettyButton from "@/components/common/button/PrettyButton";

interface PrettySidebarProps {
  /** whether sidebar is open */
  isOpen: boolean;
  /** toggle callback */
  onToggle: () => void;
  /** content of sidebar */
  children: ReactNode;
  /** replace arrow toggle with an X-button */
  toggleAsButton?: boolean;
  /** color of the X-button (red, green, blue) */
  buttonColor?: 'red' | 'green' | 'blue';
  className?: string;
}

export default function PrettySidebar({
  isOpen,
  onToggle,
  children,
  toggleAsButton = false,
  buttonColor = 'red',
  className = '',
  ...props
}: PrettySidebarProps) {
  // if using button-as-toggle and closed, unmount entirely
  if (toggleAsButton && !isOpen) return null;

  return (
    <div
      className={`transition-all duration-300 ease-in-out border-l h-full relative flex flex-col ${className}  ${
        isOpen ? 'w-96' : 'w-10 items-center justify-center '
      }`}
    >
      {toggleAsButton ? (
        // X-button in top-right corner
        <div className="absolute top-4 right-4">
          <PrettyButton
            color={buttonColor}
            onClick={onToggle}
            className="p-1 w-8 h-8 flex items-center justify-center"
          >
            X
          </PrettyButton>
        </div>
      ) : (
        // default arrow toggle
        <button
          onClick={onToggle}
          className="absolute top-4 -left-4 w-8 h-8 bg-white border rounded-full shadow flex items-center justify-center"
        >
          {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      {isOpen && <div className={`p-4 overflow-auto w-full ${className}`} {...props}>{children}</div>}
    </div>
  );
}
