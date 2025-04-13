import { forwardRef, InputHTMLAttributes } from "react";

const PrettyInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full text-center text-sm px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${className}`}
        {...props}
      />
    );
  }
);

PrettyInput.displayName = "PrettyInput";
export default PrettyInput;
