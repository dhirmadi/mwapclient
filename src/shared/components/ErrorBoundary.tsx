import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Paper, Stack, Code, Group } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'feature' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI.
 * Can be used at different levels: page, feature, or component.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary level="page">
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry) in production
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'page' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI based on level
      return this.renderDefaultFallback(error, errorInfo, level);
    }

    return children;
  }

  private renderDefaultFallback(
    error: Error | null,
    errorInfo: ErrorInfo | null,
    level: 'page' | 'feature' | 'component'
  ): ReactNode {
    const isPageLevel = level === 'page';
    const showDetails = process.env.NODE_ENV === 'development';

    if (level === 'component') {
      // Minimal inline error for component level
      return (
        <Paper withBorder p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-red-0)' }}>
          <Stack gap="xs">
            <Group gap="xs">
              <IconAlertTriangle size={16} color="var(--mantine-color-red-6)" />
              <Text size="sm" fw={600} c="red">
                Component Error
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              This component failed to render. Please try refreshing.
            </Text>
            <Button size="xs" variant="light" color="red" onClick={this.handleReset}>
              Retry
            </Button>
          </Stack>
        </Paper>
      );
    }

    // Full error page for page/feature level
    return (
      <Container size="md" py="xl">
        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg" align="center">
            <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />
            
            <Stack gap="xs" align="center">
              <Title order={isPageLevel ? 1 : 2}>
                {isPageLevel ? 'Something went wrong' : 'Feature Error'}
              </Title>
              <Text c="dimmed" ta="center">
                {isPageLevel
                  ? 'We encountered an unexpected error. Please try again.'
                  : 'This feature encountered an error and cannot be displayed.'}
              </Text>
            </Stack>

            {showDetails && error && (
              <Stack gap="xs" style={{ width: '100%' }}>
                <Text fw={600} size="sm">
                  Error Details (Development Only):
                </Text>
                <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {error.toString()}
                </Code>
                {errorInfo && (
                  <>
                    <Text fw={600} size="sm" mt="md">
                      Component Stack:
                    </Text>
                    <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {errorInfo.componentStack}
                    </Code>
                  </>
                )}
              </Stack>
            )}

            <Group gap="sm">
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleReset}
                variant="light"
              >
                Try Again
              </Button>
              {isPageLevel && (
                <Button onClick={this.handleReload}>Reload Page</Button>
              )}
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }
}

export default ErrorBoundary;

