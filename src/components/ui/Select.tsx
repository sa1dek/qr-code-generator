import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      children,
      id,
      fullWidth = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? `select-${label.replace(/\s+/g, "-")}` : undefined);

    return (
      <div className={cn("flex flex-col gap-1.5 text-start", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-text-secondary select-none block"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          <select
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full appearance-none rounded-xl border bg-surface-850 text-text-primary px-3.5 py-2.5 pl-9 text-sm transition-all duration-200 ease-out-expo outline-hidden cursor-pointer",
              "border-border-subtle focus:border-brand focus:ring-1 focus:ring-brand",
              disabled && "opacity-50 cursor-not-allowed bg-surface-800/50",
              error && "border-status-danger-border focus:border-status-danger-border focus:ring-status-danger-border/30",
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-surface-900 text-text-primary">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-text-muted transition-transform duration-200 ease-out-expo group-focus-within:rotate-180 group-focus-within:text-brand"
          />
        </div>

        {error && <span className="text-xs text-status-danger-text font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-text-muted">{helperText}</span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";