import React from "react";
import { cn } from "../../utils/utils";

//--------------|| Component Props Interface ||--------------//
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

//--------------|| Input Component ||--------------//
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
      <div className="w-full text-right">
        {/*--------------|| Input Label ||--------------*/}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#f5f5f5] mb-1.5"
          >
            {label}
          </label>
        )}

        {/*--------------|| Input Field & Elements ||--------------*/}
        <div className="relative rounded-xl">
          {finalLeft && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a3a3a3]">
              {finalLeft}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "block w-full rounded-xl border border-[#2e2e2e] bg-[#171717] px-3.5 py-2 text-sm text-[#f5f5f5] placeholder:text-[#737373] transition-colors focus:border-[#f15827] focus:outline-none focus:ring-1 focus:ring-[#f15827] disabled:bg-[#212121] disabled:text-[#a3a3a3]",
              Boolean(finalLeft) && "pl-10",
              Boolean(finalRight) && "pr-10",
              Boolean(error) &&
                "border-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-400",
              className,
            )}
            {...props}
          />
          {finalRight && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#a3a3a3]">
              {finalRight}
            </div>
          )}
        </div>

        {/*--------------|| Error & Helper Text ||--------------*/}
        {error ? (
          <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-[#a3a3a3]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
