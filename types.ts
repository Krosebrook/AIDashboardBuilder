
export type WidgetType = 'stat' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart' | 'scatter-plot' | 'radar-chart' | 'radial-bar-chart' | 'funnel-chart';

export interface ChartDataItem {
  name: string;
  value: number;
  x?: number;
  y?: number;
  z?: number; // often used for bubble/size
  category?: string;
  fill?: string; // for radial bars or specific coloring
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
  value?: string | number;
  unit?: string;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  chartData?: ChartDataItem[];
  color?: string;
  scatterConfig?: ScatterConfig;
  
  // New visual configuration options
  showDataLabels?: boolean;
  showTrendline?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  enableZoom?: boolean;
}

export interface DashboardData {
  id?: string;
  lastModified?: number;
  title: string;
  description: string;
  themeColor: string;
  widgets: DashboardWidget[];
}

export type WizardStep = 'define' | 'preview' | 'export';

export interface SampleTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}
