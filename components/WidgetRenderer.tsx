
import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList,
  ZAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend, Brush, Label
} from 'recharts';
import { DashboardWidget, ScatterConfig, ChartDataItem, ThemeVariant } from '../types';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

interface CustomScatterTooltipProps {
  active?: boolean;
  payload?: any[];
  scatterConfig?: ScatterConfig;
  colors?: string[];
}

interface WidgetRendererProps {
  widget: DashboardWidget;
  palette?: string[];
  themeVariant?: ThemeVariant;
  onEdit?: () => void;
  onViewData?: () => void;
}

const calculateTrendline = (data: ChartDataItem[]) => {
  if (data.length < 2) return [];
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  data.forEach((item, i) => {
    sumX += i;
    sumY += item.value;
    sumXY += i * item.value;
    sumXX += i * i;
  });
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return data.map((item, i) => ({ ...item, trendValue: slope * i + intercept }));
};

const formatNumber = (num: number | string | undefined) => {
  if (typeof num === 'number') return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return num ?? '-';
};

const CustomScatterTooltip = ({ active, payload, scatterConfig }: CustomScatterTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { sizeKey, colorKey } = scatterConfig || {};
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs font-medium min-w-[180px] z-50">
        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-2">Data Point: {data.name || 'Untitled'}</p>
        <div className="grid grid-cols-2 gap-4">
            <div><span className="text-slate-400">X:</span> <span className="font-bold">{formatNumber(data.x)}</span></div>
            <div><span className="text-slate-400">Y:</span> <span className="font-bold">{formatNumber(data.y)}</span></div>
            {sizeKey && <div className="col-span-2"><span className="text-slate-400">{sizeKey}:</span> <span className="font-bold">{formatNumber(data[sizeKey])}</span></div>}
            {colorKey && <div className="col-span-2"><span className="text-slate-400">{colorKey}:</span> <span className="font-bold">{data[colorKey]}</span></div>}
        </div>
      </div>
    );
  }
  return null;
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, palette, themeVariant = 'minimal', onEdit, onViewData }) => {
  const primaryColor = widget.color || '#3b82f6';
  const chartColors = palette && palette.length > 0 ? palette : DEFAULT_CHART_COLORS;
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleLegendClick = (e: any) => {
    const key = e.value || e.id || e.name; 
    setHiddenKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const processedData = useMemo(() => {
    let data = widget.chartData || [];
    if (['pie-chart', 'radial-bar-chart', 'funnel-chart'].includes(widget.type)) {
       return data.filter(d => !hiddenKeys.includes(d.name));
    }
    if (widget.showTrendline && (widget.type === 'line-chart' || widget.type === 'area-chart')) {
      return calculateTrendline(data);
    }
    return data;
  }, [widget.chartData, widget.showTrendline, widget.type, hiddenKeys]);

  const getStableColor = (name: string, index: number) => {
      const originalIndex = widget.chartData?.findIndex(d => d.name === name);
      const effectiveIndex = originalIndex !== -1 && originalIndex !== undefined ? originalIndex : index;
      return chartColors[effectiveIndex % chartColors.length];
  };

  const themeStyles = useMemo(() => {
    switch(themeVariant) {
        case 'glass': return "bg-white/30 backdrop-blur-xl border border-white/20 shadow-xl";
        case 'neo': return "bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-none";
        case 'dark': return "bg-slate-900 border border-slate-800 shadow-2xl text-white";
        case 'corporate': return "bg-white border-t-4 shadow-md rounded-lg";
        default: return "bg-white border border-slate-100 shadow-sm rounded-[2rem]";
    }
  }, [themeVariant]);

  const textColorClass = themeVariant === 'dark' ? 'text-slate-300' : 'text-slate-400';
  const headingColorClass = themeVariant === 'dark' ? 'text-white' : 'text-slate-900';

  const renderDataLabels = () => {
    if (!widget.showDataLabels) return null;
    return <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fill: themeVariant === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 'bold' }} />;
  };

  const renderChart = () => {
    const data = processedData;
    if (widget.type !== 'stat' && (!widget.chartData || widget.chartData.length === 0)) {
      return (
        <div className="h-[180px] w-full bg-slate-50/20 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No data available</p>
        </div>
      );
    }

    const commonProps = { margin: { top: 20, right: 10, bottom: 20, left: 0 } };
    const tooltipStyle = { 
        borderRadius: '12px', 
        border: 'none', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
        fontSize: '11px', 
        fontWeight: 700,
        backgroundColor: themeVariant === 'dark' ? '#1e293b' : '#fff',
        color: themeVariant === 'dark' ? '#fff' : '#1e293b'
    };
    
    const renderXAxis = (dataKey = "name") => (
      <XAxis dataKey={dataKey} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: themeVariant === 'dark' ? '#64748b' : '#94a3b8', fontWeight: 600 }} dy={10} />
    );
    const renderYAxis = () => (
      <YAxis hide={!widget.yAxisLabel} domain={['auto', 'auto']} />
    );
    const renderBrush = (dataKey = "name") => (
       widget.enableZoom && <Brush dataKey={dataKey} height={20} stroke={primaryColor} fill={themeVariant === 'dark' ? '#1e293b' : "#f8fafc"} tickFormatter={() => ''} />
    );
    const renderLegend = (props?: any) => (
      <Legend 
        onClick={handleLegendClick}
        wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px', cursor: 'pointer', ...props?.wrapperStyle }}
        formatter={(value) => {
          const isHidden = hiddenKeys.includes(value);
          return <span style={{ color: isHidden ? '#cbd5e1' : (themeVariant === 'dark' ? '#94a3b8' : '#475569'), textDecoration: isHidden ? 'line-through' : 'none' }}>{value}</span>;
        }}
        {...props}
      />
    );

    const getCategoryLegendPayload = () => {
        return (widget.chartData || []).map((item, index) => ({
            id: item.name, value: item.name, type: 'square', color: getStableColor(item.name, index), inactive: hiddenKeys.includes(item.name)
        }));
    };

    switch (widget.type) {
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} {...commonProps}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={themeVariant === 'dark' ? '#334155' : "#f1f5f9"} />
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend()}
              <Line name={widget.title} type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={3} dot={{ r: 3, fill: primaryColor, strokeWidth: 1.5, stroke: '#fff' }} hide={hiddenKeys.includes(widget.title)}>
                {renderDataLabels()}
              </Line>
              {renderBrush()}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} {...commonProps}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={themeVariant === 'dark' ? '#334155' : "#f1f5f9"} />
              {renderXAxis()}
              <Tooltip cursor={{ fill: themeVariant === 'dark' ? '#334155' : '#f8fafc' }} contentStyle={tooltipStyle} />
              {renderLegend()}
              <Bar name={widget.title} dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={24} hide={hiddenKeys.includes(widget.title)}>
                 {renderDataLabels()}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} {...commonProps}>
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={themeVariant === 'dark' ? '#334155' : "#f1f5f9"} />
              {renderXAxis()}
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend()}
              <Area name={widget.title} type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${widget.id})`} hide={hiddenKeys.includes(widget.title)}>
                 {renderDataLabels()}
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={getStableColor(entry.name, index)} />)}
                {widget.showDataLabels && <LabelList dataKey="name" position="outside" style={{ fontSize: '10px' }} />}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend({ payload: getCategoryLegendPayload() })}
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke={themeVariant === 'dark' ? '#334155' : "#e2e8f0"} />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: themeVariant === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 700 }} />
              <Radar name={widget.title} dataKey="value" stroke={primaryColor} strokeWidth={3} fill={primaryColor} fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'radial-bar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={12} data={data}>
              <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10}>
                 {data.map((entry, index) => <Cell key={`cell-${index}`} fill={getStableColor(entry.name, index)} />)}
              </RadialBar>
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend({ payload: getCategoryLegendPayload(), layout: "vertical", verticalAlign: "middle", align: "right" })}
            </RadialBarChart>
          </ResponsiveContainer>
        );
      case 'scatter-plot':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={themeVariant === 'dark' ? '#334155' : "#f1f5f9"} />
              <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <ZAxis type="number" dataKey={widget.scatterConfig?.sizeKey} range={widget.scatterConfig?.sizeRange || [50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip scatterConfig={widget.scatterConfig} />} />
              <Scatter name={widget.title} data={data} fill={primaryColor} shape={widget.scatterConfig?.shape || 'circle'}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={widget.scatterConfig?.colorKey ? getStableColor(String(entry[widget.scatterConfig.colorKey]), index) : primaryColor} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      default: return null;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className={`p-6 flex flex-col h-[340px] relative transition-all duration-500 ${themeStyles} ${themeVariant === 'corporate' ? `border-t-[${primaryColor}]` : ''}`} 
      style={themeVariant === 'corporate' ? { borderTopColor: primaryColor } : {}}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 max-w-[70%]">
          <h3 className={`${textColorClass} font-black text-[10px] uppercase tracking-[0.25em] truncate`}>
            {widget.title}
          </h3>
          <div 
            className="cursor-help text-slate-300 hover:text-indigo-400 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="w-3 h-3" />
          </div>
          
          <AnimatePresence>
            {showTooltip && widget.description && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-8 left-0 z-50 bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-2xl border border-white/10 w-48 font-bold leading-relaxed"
              >
                {widget.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
            {widget.trend && (
              <div className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${widget.trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {widget.trend.value}%
              </div>
            )}
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center overflow-hidden">
        {widget.type === 'stat' ? (
          <div className="py-2 space-y-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-5xl font-black ${headingColorClass} tracking-tighter leading-none`}>{widget.value}</span>
              {widget.unit && <span className={`${textColorClass} font-bold text-lg`}>{widget.unit}</span>}
            </div>
            <div className={`h-2 w-full rounded-full overflow-hidden mt-4 ${themeVariant === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ backgroundColor: primaryColor, width: `${Math.min(100, parseFloat(String(widget.value)) || 75)}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-0 relative">
            {renderChart()}
          </div>
        )}
      </div>

      {/* Quick Actions Hover Overlay */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onViewData && (
              <button 
                onClick={(e) => { e.stopPropagation(); onViewData(); }} 
                className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-white transition-all"
                title="View Raw Data"
              >
                <Label className="w-4 h-4" />
              </button>
          )}
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }} 
              className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-white transition-all"
              title="Widget Settings"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
      </div>
    </motion.div>
  );
};
