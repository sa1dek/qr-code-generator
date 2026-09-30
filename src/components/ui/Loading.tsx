import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text,
  className,
  fullScreen = false,
}) => {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
      <Loader2 className={cn("animate-spin text-brand", sizeClasses[size])} />
      {text && <p className="text-sm font-medium text-text-muted">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-medium backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};
