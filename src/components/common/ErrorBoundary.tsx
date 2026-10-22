import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                {this.props.fallbackTitle || 'পেজটি লোড হতে সমস্যা হয়েছে'}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                সাময়িক ত্রুটি ঘটেছে। নিচের বাটনে ক্লিক করে পেজটি পুনরায় লোড করুন।
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় লোড করুন</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
