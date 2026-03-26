import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-md text-sm
            bg-bg-primary border border-border text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-border-light
            transition-colors duration-200
            ${error ? "border-hp-low" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-hp-low">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
