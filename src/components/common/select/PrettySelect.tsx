"use client";

import { FC, SelectHTMLAttributes } from "react";

interface PrettySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}

const PrettySelect: FC<PrettySelectProps> = ({
  label,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PrettySelect;