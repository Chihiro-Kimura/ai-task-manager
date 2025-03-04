'use client';

import { AlertCircle } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="bg-destructive/10">
            <CardContent className="p-4 flex flex-col items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-destructive">
                エラーが発生しました。再読み込みしてください。
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                再読み込み
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
