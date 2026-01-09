
import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { DashboardWidget } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const WidgetRenderer: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const renderChart = () => {
    if (!widget.chartData || widget.chartData.length === 0) {
      if (widget.type !== 'stat') return <div className="h-[200px] flex items-center justify-center text-slate-300 italic text-sm">No chart data</div>;
      return null;
    }

    switch (widget.type) {
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={widget.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={widget.color || '#3b82f6'} 
                strokeWidth={3} 
                dot={{ r: 4, fill: widget.color || '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={widget.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="value" fill={widget.color || '#3b82f6'} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={widget.chartData}>
              <defs>
                <linearGradient id={`color-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={widget.color || '#3b82f6'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={widget.color || '#3b82f6'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={widget.color || '#3b82f6'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color-${widget.id})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={widget.chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {widget.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[280px] hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{widget.title}</h3>
        {widget.trend && (
          <div className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full ${widget.trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {widget.trend.isUpward ? '↑' : '↓'} {widget.trend.value}%
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {widget.type === 'stat' ? (
          <div className="py-2">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-900 tracking-tight">{widget.value}</span>
              {widget.unit && <span className="text-slate-400 font-bold text-lg">{widget.unit}</span>}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {renderChart()}
          </div>
        )}
      </div>
    </div>
  );
};
