'use client';

import { ButtonHTMLAttributes, FC } from 'react';

interface PrettyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'green' | 'red' | 'blue';
  loading?: boolean;
  outlined?: boolean; // default true
}

const PrettyButton: FC<PrettyButtonProps> = ({
  color = 'green',
  className = '',
  loading = false,
  outlined = true,
  children,
  ...props
}) => {
  // Define classes explicitly for each color to satisfy Tailwind
  const base =
    'px-4 py-2 rounded transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center gap-2 border font-semibold';

  // Map colors to Tailwind classes for outlined style
  const outlinedClasses = {
    green: 'text-green-500 border-green-500 hover:bg-green-500 hover:text-white',
    blue: 'text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white',
    red: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white',
  };

  // Map colors to Tailwind classes for filled style
  const filledClasses = {
    green: 'bg-green-300 text-white hover:scale-[1.02]',
    blue: 'bg-blue-300 text-white hover:scale-[1.02]',
    red: 'bg-red-300 text-white hover:scale-[1.02]',
  };

  const colorClasses = outlined
    ? outlinedClasses[color]
    : filledClasses[color];

  return (
    <button
      className={`${base} ${colorClasses} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default PrettyButton;
