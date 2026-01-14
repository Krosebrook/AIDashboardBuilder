
export type WidgetType = 'stat' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart' | 'scatter-plot' | 'radar-chart' | 'radial-bar-chart' | 'funnel-chart';

export interface ChartDataItem {
  name: string;
  value: number;
  date?: string; // Added for date filtering
  x?: number;
  y?: number;
  z?: number;
  category?: string;
  fill?: string;
  [key: string]: string | number | undefined;
}

export type ScatterShape = 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';

export interface ScatterConfig {
  sizeKey?: string;
  colorKey?: string;
  shape?: ScatterShape;
  sizeRange?: [number, number];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  value?: string | number;
  unit?: string;
  loading?: boolean; // Added for skeleton loaders
  trend?: {
    value: number;
    isUpward: boolean;
  };
  chartData?: ChartDataItem[];
  color?: string;
  scatterConfig?: ScatterConfig;
  
  showDataLabels?: boolean;
  showTrendline?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  enableZoom?: boolean;
}

export type ThemeVariant = 'minimal' | 'glass' | 'neo' | 'dark' | 'corporate' | 'colorful';

export interface DashboardData {
  id?: string;
  lastModified?: number;
  title: string;
  description: string;
  themeColor: string;
  themeVariant?: ThemeVariant;
  layoutColumns?: 1 | 2 | 3;
  widgets: DashboardWidget[];
}

export type WizardStep = 'define' | 'preview' | 'export';

export interface SampleTemplate {
  id: string;
  name: string;
  icon: string;
  category: string;
  prompt: string;
}
