import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "../../../components/ui/Input";

//--------------|| Show / Hide Password Toggle ||--------------//
// Wraps the shared Input with an eye button that switches the field between
// type="password" and type="text".
//
// The shared Input renders `rightElement` inside a `pointer-events-none`
// wrapper, so the button re-enables pointer events for itself.

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  initialVisible?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ initialVisible = false, rightElement, disabled, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(initialVisible);

  return (
    <Input
      {...props}
      ref={ref}
      type={isVisible ? "text" : "password"}
      rightElement={
        <>
          {rightElement}
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            disabled={disabled}
            aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={isVisible}
            title={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="pointer-events-auto -mr-1 rounded-lg p-1 text-text-muted transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:pointer-events-none disabled:text-text-disabled"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </>
      }
    />
  );
});

PasswordInput.displayName = "PasswordInput";
