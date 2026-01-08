/**
 * Component prop types
 */

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  enableParallax?: boolean;
}

export interface DiagramProps {
  type: 'flowchart' | 'sequence' | 'architecture' | 'mindmap';
  data: DiagramData;
  lazyLoad?: boolean;
  className?: string;
  onLoad?: () => void;
}

export interface DiagramData {
  nodes?: Node[];
  edges?: Edge[];
  config?: Record<string, unknown>;
}

export interface Node {
  id: string;
  label: string;
  type?: string;
  position?: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
