import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 rounded-md text-sm resize-none
            bg-bg-primary border border-border text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-border-light
            transition-colors duration-200
            ${className}
          `}
          rows={3}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
