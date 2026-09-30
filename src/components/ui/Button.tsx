import React from "react";
import { cn } from "../../utils/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ease-out-expo select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]";

    const variants = {
      primary:
        "bg-brand text-text-inverse hover:bg-brand-hover focus-visible:ring-brand/50",
      secondary:
        "bg-surface-800 text-text-primary hover:bg-surface-750 focus-visible:ring-surface-600 border border-border-subtle shadow-2xs",
      outline:
        "bg-transparent text-text-primary hover:bg-surface-800/60 focus-visible:ring-brand/50 border border-border-subtle",
      ghost:
        "bg-transparent text-text-secondary hover:bg-surface-800/60 hover:text-text-primary focus-visible:ring-surface-600",
      danger:
        "bg-danger text-text-on-accent hover:bg-danger-hover focus-visible:ring-danger/50 border border-danger-hover/40 shadow-2xs",
      success:
        "bg-success text-text-on-accent hover:bg-success-hover focus-visible:ring-success/50 border border-success-hover/40 shadow-2xs",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";