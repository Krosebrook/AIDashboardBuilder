import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList,
  ZAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend, Brush, Label
} from 'recharts';
import { DashboardWidget, ScatterConfig, ChartDataItem } from '../types';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

interface CustomScatterTooltipProps {
  active?: boolean;
  payload?: any[];
  scatterConfig?: ScatterConfig;
}

// Simple Linear Regression for Trendlines
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

  return data.map((item, i) => ({
    ...item,
    trendValue: slope * i + intercept
  }));
};

const formatNumber = (num: number | string | undefined) => {
  if (typeof num === 'number') {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return num ?? '-';
};

const CustomScatterTooltip = ({ active, payload, scatterConfig }: CustomScatterTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { sizeKey, colorKey } = scatterConfig || {};

    const getValue = (key: string) => data[key];

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs font-medium min-w-[180px] z-50">
        <div className="mb-3 border-b border-white/10 pb-2">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Data Point</p>
          <p className="text-white font-bold text-sm truncate">{data.name || 'Untitled'}</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">X Axis</span>
              <span className="font-mono text-indigo-300 font-bold text-sm">{formatNumber(data.x)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Y Axis</span>
              <span className="font-mono text-indigo-300 font-bold text-sm">{formatNumber(data.y)}</span>
            </div>
          </div>

          {(sizeKey || colorKey || data.z !== undefined || data.category) && (
            <div className="border-t border-white/10 pt-3 space-y-2">
              {sizeKey && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400 truncate">Size ({sizeKey})</span>
                  <span className="font-mono text-emerald-300 font-bold">{formatNumber(getValue(sizeKey))}</span>
                </div>
              )}
              
              {colorKey && colorKey !== sizeKey && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400 truncate">Color ({colorKey})</span>
                  <span className="font-mono text-emerald-300 font-bold truncate max-w-[80px]">{getValue(colorKey)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const WidgetRenderer: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const primaryColor = widget.color || '#3b82f6';
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]); // Stores names of hidden legend items

  // Toggle visibility of legend items
  const handleLegendClick = (e: any) => {
    const key = e.value || e.id || e.name; // Recharts payload shape varies
    setHiddenKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const processedData = useMemo(() => {
    let data = widget.chartData || [];
    
    // Filter data for categorical charts based on legend state
    if (['pie-chart', 'radar-chart', 'radial-bar-chart', 'funnel-chart'].includes(widget.type)) {
       // For these, legend items usually match 'name'
       // However, we don't want to remove data points for Radar, just maybe hide series? 
       // For Pie/Funnel it's usually filtering slices.
       // Let's implement slice filtering for Pie/Radial/Funnel
    }
    
    if (widget.showTrendline && (widget.type === 'line-chart' || widget.type === 'area-chart')) {
      return calculateTrendline(data);
    }
    return data;
  }, [widget.chartData, widget.showTrendline, widget.type]);

  // Scatter plot metadata
  const scatterMeta = useMemo(() => {
    if (widget.type !== 'scatter-plot') return null;
    const colorKey = widget.scatterConfig?.colorKey;
    
    // Explicitly handle undefined/empty colorKey
    if (!colorKey) {
        return { colorKey, categories: [], colorMap: {} };
    }

    // Safely map categories without 'as any' casting
    const rawCategories = (widget.chartData || []).map(d => {
        const val = d[colorKey as string]; // Valid due to ChartDataItem index signature
        return String(val ?? 'Uncategorized');
    });

    const categories = [...new Set(rawCategories)].filter(cat => cat !== 'undefined');
    
    const colorMap: Record<string, string> = {};
    categories.forEach((cat, i) => { colorMap[cat] = CHART_COLORS[i % CHART_COLORS.length]; });
    
    return { colorKey, categories, colorMap };
  }, [widget.type, widget.chartData, widget.scatterConfig?.colorKey]);

  const renderChart = () => {
    const data = processedData;
    if (widget.type !== 'stat' && data.length === 0) {
      return (
        <div className="h-[180px] w-full bg-slate-50/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No data available</p>
        </div>
      );
    }

    const commonProps = {
      margin: { top: 10, right: 20, bottom: 20, left: 0 }
    };

    const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 700 };
    
    // Common Axis Components
    const renderXAxis = (dataKey = "name") => (
      <XAxis 
        dataKey={dataKey} 
        axisLine={false} 
        tickLine={false} 
        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} 
        dy={10}
      >
        {widget.xAxisLabel && <Label value={widget.xAxisLabel} offset={-10} position="insideBottom" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 700 }} />}
      </XAxis>
    );

    const renderYAxis = () => (
      <YAxis hide={!widget.yAxisLabel} domain={['auto', 'auto']}>
         {widget.yAxisLabel && <Label value={widget.yAxisLabel} angle={-90} position="insideLeft" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 700 }} />}
      </YAxis>
    );

    // Common Zoom Brush
    const renderBrush = (dataKey = "name") => (
       widget.enableZoom && <Brush dataKey={dataKey} height={20} stroke={primaryColor} fill="#f8fafc" tickFormatter={() => ''} />
    );

    // Common Legend
    const renderLegend = () => (
      <Legend 
        onClick={handleLegendClick}
        wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px', cursor: 'pointer' }}
        formatter={(value, entry: any) => {
          const isHidden = hiddenKeys.includes(value);
          return <span style={{ color: isHidden ? '#cbd5e1' : '#475569', textDecoration: isHidden ? 'line-through' : 'none' }}>{value}</span>;
        }}
      />
    );

    // Check if main series is hidden (for Line/Bar/Area where there's usually 1 series)
    const isSeriesHidden = hiddenKeys.includes(widget.title);

    switch (widget.type) {
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} {...commonProps}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend()}
              {!isSeriesHidden && (
                <Line 
                  name={widget.title}
                  type="monotone" 
                  dataKey="value" 
                  stroke={primaryColor} 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: primaryColor, strokeWidth: 1.5, stroke: '#fff' }} 
                  activeDot={{ r: 5, strokeWidth: 0 }}
                >
                   {widget.showDataLabels && <LabelList dataKey="value" position="top" fontSize={9} fontWeight={700} fill="#64748b" />}
                </Line>
              )}
              {widget.showTrendline && !isSeriesHidden && (
                <Line type="monotone" dataKey="trendValue" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trend" />
              )}
              {renderBrush()}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} {...commonProps}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
              {renderLegend()}
              {!isSeriesHidden && (
                <Bar name={widget.title} dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={24}>
                  {widget.showDataLabels && <LabelList dataKey="value" position="top" fontSize={9} fontWeight={700} fill="#64748b" />}
                </Bar>
              )}
              {renderBrush()}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} {...commonProps}>
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              {renderXAxis()}
              {renderYAxis()}
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend()}
              {!isSeriesHidden && (
                <Area name={widget.title} type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${widget.id})`}>
                  {widget.showDataLabels && <LabelList dataKey="value" position="top" fontSize={9} fontWeight={700} fill="#64748b" />}
                </Area>
              )}
              {widget.showTrendline && !isSeriesHidden && (
                <Line type="monotone" dataKey="trendValue" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trend" />
              )}
              {renderBrush()}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={hiddenKeys.includes(entry.name) ? '#e2e8f0' : CHART_COLORS[index % CHART_COLORS.length]} 
                    stroke={hiddenKeys.includes(entry.name) ? '#cbd5e1' : 'none'}
                    fillOpacity={hiddenKeys.includes(entry.name) ? 0.3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend 
                onClick={handleLegendClick} 
                wrapperStyle={{ fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                formatter={(value) => <span style={{ textDecoration: hiddenKeys.includes(value) ? 'line-through' : 'none', color: hiddenKeys.includes(value) ? '#cbd5e1' : '#475569' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              {!isSeriesHidden && (
                <Radar 
                  name={widget.title} 
                  dataKey="value" 
                  stroke={primaryColor} 
                  strokeWidth={3} 
                  fill={primaryColor} 
                  fillOpacity={0.25} 
                />
              )}
              <Tooltip contentStyle={tooltipStyle} />
              {renderLegend()}
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'radial-bar-chart':
        // Filter hidden keys from data for Radial Bar
        const radialData = data.filter(d => !hiddenKeys.includes(d.name));
        return (
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={12} data={data}>
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
              >
                 {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={hiddenKeys.includes(entry.name) ? '#e2e8f0' : CHART_COLORS[index % CHART_COLORS.length]} 
                    fillOpacity={hiddenKeys.includes(entry.name) ? 0.1 : 1}
                  />
                ))}
                <LabelList position="insideStart" fill="#fff" dataKey="value" fontSize={8} fontWeight={700} />
              </RadialBar>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                onClick={handleLegendClick}
                wrapperStyle={{ fontSize: '9px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }} 
                formatter={(value) => <span style={{ textDecoration: hiddenKeys.includes(value) ? 'line-through' : 'none', color: hiddenKeys.includes(value) ? '#cbd5e1' : '#475569' }}>{value}</span>}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      case 'funnel-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <FunnelChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Funnel
                dataKey="value"
                data={data}
                isAnimationActive
              >
                {data.map((entry, index) => (
                   <Cell 
                    key={`cell-${index}`} 
                    fill={hiddenKeys.includes(entry.name) ? '#e2e8f0' : CHART_COLORS[index % CHART_COLORS.length]} 
                    fillOpacity={hiddenKeys.includes(entry.name) ? 0.3 : 1}
                   />
                ))}
                <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" fontSize={9} fontWeight={600} />
                {widget.showDataLabels && (
                    <LabelList position="inside" fill="#fff" stroke="none" dataKey="value" fontSize={10} fontWeight={800} />
                )}
              </Funnel>
              <Legend 
                onClick={handleLegendClick}
                wrapperStyle={{ fontSize: '10px', fontWeight: 600, cursor: 'pointer', paddingTop: 10 }} 
                formatter={(value) => <span style={{ textDecoration: hiddenKeys.includes(value) ? 'line-through' : 'none', color: hiddenKeys.includes(value) ? '#cbd5e1' : '#475569' }}>{value}</span>}
              />
            </FunnelChart>
          </ResponsiveContainer>
        );
      case 'scatter-plot':
        if (!scatterMeta) return null;
        const { colorKey, categories, colorMap } = scatterMeta;
        
        // Filter scatter data based on hidden categories
        const visibleScatterData = data.filter(d => {
             const cat = colorKey ? String((d as any)[colorKey as string] || 'Uncategorized') : 'Uncategorized';
             return !hiddenKeys.includes(cat);
        });

        return (
          <div className="flex flex-col h-full w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={150}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }}>
                     {widget.xAxisLabel && <Label value={widget.xAxisLabel} offset={-10} position="insideBottom" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 700 }} />}
                </XAxis>
                <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }}>
                     {widget.yAxisLabel && <Label value={widget.yAxisLabel} angle={-90} position="insideLeft" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 700 }} />}
                </YAxis>
                <ZAxis 
                  type="number" 
                  dataKey={widget.scatterConfig?.sizeKey} 
                  range={widget.scatterConfig?.sizeRange || [50, 400]} 
                  name="Size"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} 
                  content={<CustomScatterTooltip scatterConfig={widget.scatterConfig} />}
                  isAnimationActive={false} 
                />
                <Scatter 
                  name={widget.title} 
                  data={visibleScatterData} 
                  fill={primaryColor} 
                  shape={widget.scatterConfig?.shape || 'circle'}
                >
                  {visibleScatterData.map((entry, index) => {
                    const catValue = colorKey ? String((entry as any)[colorKey as string] || 'Uncategorized') : '';
                    const fill = colorKey ? (colorMap[catValue] || primaryColor) : primaryColor;
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Scatter>
                {renderBrush("x")}
              </ScatterChart>
            </ResponsiveContainer>
            
            {colorKey && categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center max-h-[60px] overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-slate-200">
                {categories.map((cat) => {
                  const isHidden = hiddenKeys.includes(cat);
                  return (
                    <div 
                        key={cat} 
                        onClick={() => handleLegendClick({ value: cat })}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md shadow-sm cursor-pointer transition-all ${isHidden ? 'bg-slate-100 opacity-50' : 'bg-slate-50 border border-slate-100'}`}
                    >
                        <div className="w-2 h-2 rounded-full ring-1 ring-white" style={{ backgroundColor: isHidden ? '#cbd5e1' : colorMap[cat] }} />
                        <span className={`text-[9px] font-bold uppercase tracking-wide truncate max-w-[80px] ${isHidden ? 'text-slate-400 line-through' : 'text-slate-500'}`} title={cat}>{cat}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[320px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] truncate pr-2">{widget.title}</h3>
        {widget.trend && (
          <div className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${widget.trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {widget.trend.isUpward ? '↑' : '↓'} {widget.trend.value}%
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center overflow-hidden">
        {widget.type === 'stat' ? (
          <div className="py-2 space-y-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{widget.value}</span>
              {widget.unit && <span className="text-slate-400 font-bold text-lg">{widget.unit}</span>}
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
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
    </div>
  );
};