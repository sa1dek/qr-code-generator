import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 text-right" dir="rtl">
          <div className="bg-[#212121] border border-[#333333] p-6 rounded-2xl max-w-md w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-100">حدث خطأ غير متوقع</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "حدث خطأ أثناء تحميل هذا الجزء من التطبيق."}
            </p>
            <Button
              size="sm"
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="mx-auto"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
