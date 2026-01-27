/**
 * Error Boundary для обработки ошибок React
 */

import { Component } from 'react';
import type { ReactNode } from 'react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // В production можно отправлять ошибки в сервис мониторинга
    if (import.meta.env.PROD) {
      // Пример: отправка в Sentry, LogRocket и т.д.
      // trackError(error, errorInfo);
      
      // Логируем детали для отладки
      try {
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      } catch (e) {
        console.error('Failed to log error details:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="card max-w-md text-center animate-fade-in">
            <p className="text-6xl mb-4">💥</p>
            <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            {this.state.error && (
              <div className="mb-4 p-4 rounded-lg text-left text-sm" style={{ backgroundColor: 'var(--color-background)', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                <p className="font-semibold mb-2">Детали ошибки:</p>
                <p className="text-red-400 break-all mb-2">{this.state.error.message || this.state.error.toString()}</p>
                {import.meta.env.DEV && this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Показать stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                {import.meta.env.PROD && (
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Откройте консоль браузера (F12) для подробностей
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                className="flex-1"
              >
                Попробовать снова
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Обновить страницу
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
