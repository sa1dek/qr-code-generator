import React from "react";
import { cn } from "../../utils/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const finalLeft = leftElement || leftIcon;
    const finalRight = rightElement || rightIcon;
    const inputId =
      id ||
      (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

    return (
      <div className="w-full text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-xl">
          {finalLeft && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              {finalLeft}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "block w-full rounded-xl border bg-surface-850 px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-surface-800 disabled:text-text-disabled",
              "border-border-subtle",
              Boolean(finalLeft) && "pl-10",
              Boolean(finalRight) && "pr-10",
              Boolean(error) &&
                "border-status-danger-border focus:border-status-danger-border focus:ring-status-danger-border text-status-danger-text",
              className,
            )}
            {...props}
          />
          {finalRight && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
              {finalRight}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-status-danger-text font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";