import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  ScatterChart, Scatter, ZAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DashboardWidget, ScatterConfig } from '../types';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface CustomScatterTooltipProps {
  active?: boolean;
  payload?: any[];
  scatterConfig?: ScatterConfig;
}

const formatNumber = (num: any) => {
  if (typeof num === 'number') {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return num;
};

const CustomScatterTooltip = ({ active, payload, scatterConfig }: CustomScatterTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { sizeKey, colorKey } = scatterConfig || {};

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs font-medium min-w-[160px]">
        <div className="mb-3 border-b border-white/10 pb-2">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Data Point</p>
          <p className="text-white font-bold text-sm">{data.name || 'Untitled'}</p>
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
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Size ({sizeKey})</span>
                  <span className="font-mono text-emerald-300 font-bold">{formatNumber(data[sizeKey as string])}</span>
                </div>
              )}
              
              {colorKey && colorKey !== sizeKey && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Color ({colorKey})</span>
                  <span className="font-mono text-emerald-300 font-bold">{data[colorKey as string]}</span>
                </div>
              )}

              {!sizeKey && data.z !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Z Value</span>
                  <span className="font-mono text-slate-200">{formatNumber(data.z)}</span>
                </div>
              )}

              {!colorKey && data.category && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Category</span>
                  <span className="font-mono text-slate-200">{data.category}</span>
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

  const renderChart = () => {
    const data = widget.chartData || [];
    if (widget.type !== 'stat' && data.length === 0) {
      return (
        <div className="h-[180px] w-full bg-slate-50/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No data available</p>
        </div>
      );
    }

    switch (widget.type) {
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 700 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                strokeWidth={3} 
                dot={{ r: 3, fill: primaryColor, strokeWidth: 1.5, stroke: '#fff' }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 700 }}
              />
              <Bar dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 700 }} />
              <Area type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${widget.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontSize: '10px', fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter-plot':
        const colorKey = widget.scatterConfig?.colorKey;
        const categories = colorKey 
          ? [...new Set(data.map(d => String(d[colorKey as string] || 'Uncategorized')))].filter(cat => cat !== 'undefined')
          : [];
        
        const colorMap: Record<string, string> = {};
        categories.forEach((cat, i) => {
          colorMap[cat] = CHART_COLORS[i % CHART_COLORS.length];
        });

        return (
          <div className="flex flex-col h-full">
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <ZAxis 
                  type="number" 
                  dataKey={widget.scatterConfig?.sizeKey} 
                  range={widget.scatterConfig?.sizeRange || [50, 250]} 
                  name="Size"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={<CustomScatterTooltip scatterConfig={widget.scatterConfig} />}
                />
                <Scatter 
                  name={widget.title} 
                  data={data} 
                  fill={primaryColor} 
                  shape={widget.scatterConfig?.shape || 'circle'}
                >
                  {data.map((entry, index) => {
                    const catValue = colorKey ? String(entry[colorKey as string] || 'Uncategorized') : '';
                    const fill = colorKey ? (colorMap[catValue] || primaryColor) : primaryColor;
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Custom Legend for Categories */}
            {colorKey && categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-[60px] overflow-y-auto px-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: colorMap[cat] }} />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[80px]">{cat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[300px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.25em]">{widget.title}</h3>
        {widget.trend && (
          <div className={`flex items-center text-[9px] font-black px-2 py-0.5 rounded-full ${widget.trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {widget.trend.isUpward ? '↑' : '↓'} {widget.trend.value}%
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center overflow-hidden">
        {widget.type === 'stat' ? (
          <div className="py-2 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black text-slate-900 tracking-tight leading-none">{widget.value}</span>
              {widget.unit && <span className="text-slate-400 font-bold text-lg">{widget.unit}</span>}
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ backgroundColor: primaryColor, width: `${Math.min(100, parseFloat(String(widget.value)) || 75)}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {renderChart()}
          </div>
        )}
      </div>
    </div>
  );
};
