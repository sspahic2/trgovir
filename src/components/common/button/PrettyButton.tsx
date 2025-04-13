'use client';

import { ButtonHTMLAttributes, FC } from 'react';

interface PrettyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'green' | 'red' | 'blue';
  loading?: boolean;
}

const PrettyButton: FC<PrettyButtonProps> = ({
  color = 'green',
  className = '',
  loading = false,
  children,
  ...props
}) => {
  const base =
    'px-4 py-2 rounded text-white transition-all duration-200 ease-in-out hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2';
  const bg =
    color === 'green'
      ? 'bg-green-300'
      : color === 'blue'
      ? 'bg-blue-300'
      : 'bg-red-300';

  return (
    <button className={`${base} ${bg} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
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
