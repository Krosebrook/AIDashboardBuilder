'use client';

/**
 * Lazy-loaded Diagram components
 * Features:
 * - React.lazy() and Suspense for code splitting
 * - IntersectionObserver for deferred loading
 * - SSR-compatible fallbacks
 * - Modular per-diagram architecture
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { DiagramProps } from '@/types/components';
import { logUserInteraction } from '@/lib/logger';

// Lazy load diagram components
const FlowchartDiagram = lazy(() => import('./diagrams/FlowchartDiagram'));
const SequenceDiagram = lazy(() => import('./diagrams/SequenceDiagram'));
const ArchitectureDiagram = lazy(() => import('./diagrams/ArchitectureDiagram'));
const MindmapDiagram = lazy(() => import('./diagrams/MindmapDiagram'));

/**
 * Loading fallback component
 */
const DiagramLoader: React.FC = () => (
  <div
    className="flex items-center justify-center h-64 bg-gray-100 rounded-lg animate-pulse"
    role="status"
    aria-label="Loading diagram"
  >
    <div className="text-center">
      <svg
        className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-gray-600 font-medium">Loading diagram...</p>
    </div>
  </div>
);

/**
 * Error fallback component
 */
const DiagramError: React.FC<{ error?: Error }> = ({ error }) => (
  <div
    className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg"
    role="alert"
    aria-live="polite"
  >
    <div className="text-center px-4">
      <svg
        className="h-10 w-10 text-red-600 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-red-800 font-medium mb-2">Failed to load diagram</p>
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
    </div>
  </div>
);

/**
 * Main Diagrams component with lazy loading
 */
export const Diagrams: React.FC<DiagramProps> = ({
  type,
  data,
  lazyLoad = true,
  className = '',
  onLoad,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const [hasError, setHasError] = useState(false);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazyLoad || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            logUserInteraction({
              event: 'diagram_visible',
              component: 'Diagrams',
              metadata: { type },
            });
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, shouldLoad, type]);

  // Handle diagram load
  const handleLoad = React.useCallback(() => {
    logUserInteraction({
      event: 'diagram_loaded',
      component: 'Diagrams',
      metadata: { type },
    });
    onLoad?.();
  }, [type, onLoad]);

  // Error boundary handler
  const handleError = React.useCallback((error: Error) => {
    console.error('Diagram loading error:', error);
    setHasError(true);
  }, []);

  // Select the appropriate diagram component
  const DiagramComponent = React.useMemo(() => {
    switch (type) {
      case 'flowchart':
        return FlowchartDiagram;
      case 'sequence':
        return SequenceDiagram;
      case 'architecture':
        return ArchitectureDiagram;
      case 'mindmap':
        return MindmapDiagram;
      default:
        return null;
    }
  }, [type]);

  if (!DiagramComponent) {
    return <DiagramError error={new Error(`Unknown diagram type: ${type}`)} />;
  }

  if (hasError) {
    return <DiagramError />;
  }

  return (
    <div
      ref={containerRef}
      className={`diagram-container ${className}`}
      role="img"
      aria-label={`${type} diagram`}
    >
      {shouldLoad ? (
        <Suspense fallback={<DiagramLoader />}>
          <ErrorBoundary onError={handleError}>
            <DiagramComponent data={data} onLoad={handleLoad} />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <DiagramLoader />
      )}
    </div>
  );
};

/**
 * Error Boundary Component
 */
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Diagram error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <DiagramError />;
    }

    return this.props.children;
  }
}

export default Diagrams;
