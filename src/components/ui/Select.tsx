import React, { forwardRef } from "react";
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
      <div className={cn("flex flex-col gap-1.5 text-right", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-300 select-none block"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full appearance-none rounded-xl border bg-[#1e1e1e] text-slate-100 px-3.5 py-2.5 text-sm transition-all outline-hidden cursor-pointer",
              "border-[#333333] focus:border-[#f15827] focus:ring-1 focus:ring-[#f15827]",
              disabled && "opacity-50 cursor-not-allowed bg-slate-800/50",
              error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30",
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#212121] text-white">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>

        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-400">{helperText}</span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
