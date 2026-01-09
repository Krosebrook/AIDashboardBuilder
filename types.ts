
export type WidgetType = 'stat' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart';

export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
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
}

export interface DashboardData {
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
