
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, FileText, ChevronRight, Sparkles, AlertCircle, Github, 
  Loader2, Edit3, Trash2, X, Settings2, Layout,
  MessageSquare, Send, ArrowLeft,
  Box, Palette, Maximize, TrendingUp, Type, ZoomIn, Eye,
  Save, FolderOpen, Clock, ChevronRight as ChevronRightIcon,
  Table2, BarChart3, Columns, Monitor, Database, Download, Shapes, Calendar,
  Sun, Moon, Palette as PaletteIcon, Filter, Search, Grid, Circle, Square, Star, Triangle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardData, WizardStep, DashboardWidget, WidgetType, ScatterShape, ThemeVariant, ChartDataItem, SampleTemplate } from './types';
import { SAMPLE_TEMPLATES, TEMPLATE_CATEGORIES } from './constants';
import { generateDashboardSchema, updateDashboardSchema } from './geminiService';
import { WidgetRenderer } from './components/WidgetRenderer';
import { generateHtmlReport } from './utils/reportGenerator';
import { getSavedDashboards, saveDashboardToLibrary, deleteDashboardFromLibrary } from './utils/storage';
import { DataTableEditor } from './components/DataTableEditor';

const DashboardSkeleton = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-4 max-w-xl pt-10"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div><div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse"></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 h-[300px] animate-pulse"></div>))}</div>
    </motion.div>
);

type DrawerTab = 'settings' | 'data';
type AppMode = 'builder' | 'global-settings' | 'library' | 'raw-data' | 'templates';

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('define');
  const [prompt, setPrompt] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatCommand, setChatCommand] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [viewingDataWidgetId, setViewingDataWidgetId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('settings');
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<DashboardData[]>([]);
  
  // Template Gallery state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templateSearch, setTemplateSearch] = useState("");

  // Date range filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => { setSavedDashboards(getSavedDashboards()); }, []);
  useEffect(() => { if (!editingWidgetId) setDrawerTab('settings'); }, [editingWidgetId]);

  const handleSave = () => {
    if (!dashboardData) return;
    try {
      const saved = saveDashboardToLibrary(dashboardData);
      setDashboardData(saved);
      setSavedDashboards(getSavedDashboards());
    } catch (err) { setError("Failed to save."); }
  };

  const handleLoad = (dashboard: DashboardData) => {
    setDashboardData(dashboard);
    setStep('preview');
    setAppMode(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete dashboard?')) {
      deleteDashboardFromLibrary(id);
      setSavedDashboards(getSavedDashboards());
      if (dashboardData?.id === id) { setDashboardData(null); setStep('define'); }
    }
  };

  const handleGenerate = async (p: string) => {
    if (!p.trim()) return;
    setLoading(true); setError(null);
    setAppMode(null); // Close template gallery if open
    try {
      const data = await generateDashboardSchema(p);
      setDashboardData({ ...data, layoutColumns: 3, themeVariant: 'minimal' });
      setStep('preview');
    } catch (err: any) { setError(err.message || "Generation failed."); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData || !chatCommand.trim() || isUpdating) return;
    setIsUpdating(true); setError(null);
    try {
      const updated = await updateDashboardSchema(dashboardData, chatCommand);
      const final = { ...updated, id: dashboardData.id, lastModified: dashboardData.id ? Date.now() : undefined };
      setDashboardData(final); setChatCommand('');
      if (final.id) saveDashboardToLibrary(final);
      setSavedDashboards(getSavedDashboards());
    } catch (err: any) { setError(err.message || "Update failed."); }
    finally { setIsUpdating(false); }
  };

  const handleExport = () => {
    if (!dashboardData) return;
    const html = generateHtmlReport(dashboardData);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    link.download = `report-${Date.now()}.html`;
    link.click();
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    if (!dashboardData) return;
    const newData = { ...dashboardData, widgets: dashboardData.widgets.map(w => w.id === id ? { ...w, ...updates } : w) };
    setDashboardData(newData);
    if (newData.id) saveDashboardToLibrary(newData);
  };

  const addPieChartWidget = () => {
    if (!dashboardData) return;
    const newWidget: DashboardWidget = {
      id: crypto.randomUUID(),
      type: 'pie-chart',
      title: 'Category Distribution',
      description: 'An overview of distribution across various categories.',
      chartData: [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 300 },
        { name: 'Category D', value: 200 },
      ],
      color: dashboardData.themeColor,
      showDataLabels: true
    };
    setDashboardData({
      ...dashboardData,
      widgets: [...dashboardData.widgets, newWidget]
    });
  };

  const downloadCSV = (widget: DashboardWidget) => {
    const data = widget.chartData;
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const headers = keys.join(',');
    const rows = data.map(row => keys.map(k => String(row[k] ?? '')).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${widget.title.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEditingWidget = dashboardData?.widgets.find(w => w.id === editingWidgetId);
  const currentDataWidget = dashboardData?.widgets.find(w => w.id === viewingDataWidgetId);

  // Computed: Filtered Templates
  const filteredTemplates = useMemo(() => {
    return SAMPLE_TEMPLATES.filter(t => {
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
      const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
                           t.prompt.toLowerCase().includes(templateSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, templateSearch]);

  // Computed: Filtered Widgets Data
  const filteredWidgets = useMemo(() => {
    if (!dashboardData) return [];
    if (!startDate && !endDate) return dashboardData.widgets;

    return dashboardData.widgets.map(widget => {
      if (!widget.chartData) return widget;
      
      const filteredData = widget.chartData.filter(item => {
        if (!item.date) return true; // Keep data without dates
        const itemDate = new Date(item.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
      });

      return { ...widget, chartData: filteredData };
    });
  }, [dashboardData, startDate, endDate]);

  return (
    <div className={`min-h-screen transition-all duration-700 ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <nav className={`bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setStep('define'); setDashboardData(null); }}>
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg hover:scale-105 transition-transform"><Layout className="w-6 h-6 text-white" /></div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic hidden sm:block">Dash<span className="text-indigo-600">Gen</span></h1>
            </div>
            <button onClick={() => setAppMode('library')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100/50 rounded-full transition-colors"><FolderOpen className="w-4 h-4" /> Library</button>
            <button onClick={() => setAppMode('templates')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100/50 rounded-full transition-colors"><Grid className="w-4 h-4" /> Templates</button>
          </div>
          
          {dashboardData && (
             <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border dark:border-slate-700">
                <button 
                  onClick={() => setDashboardData({...dashboardData, themeVariant: 'minimal'})}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${dashboardData.themeVariant === 'minimal' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button 
                  onClick={() => setDashboardData({...dashboardData, themeVariant: 'dark'})}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${dashboardData.themeVariant === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button 
                  onClick={() => setDashboardData({...dashboardData, themeVariant: 'colorful'})}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${dashboardData.themeVariant === 'colorful' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
                >
                  <PaletteIcon className="w-3.5 h-3.5" /> Color
                </button>
             </div>
          )}

          <div className="flex items-center gap-3">
             {dashboardData && (
               <div className="flex items-center gap-2">
                 <button onClick={() => setAppMode('global-settings')} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"><Settings2 className="w-5 h-5" /></button>
                 <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-emerald-600 hover:bg-emerald-50"><Save className="w-4 h-4" /> Save</button>
               </div>
             )}
            {step === 'preview' && (
              <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl">
                <FileText className="w-4 h-4" /> Export
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {loading ? <DashboardSkeleton key="loader" /> : step === 'define' ? (
            <motion.div key="hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pt-24 px-6 text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-10 border border-indigo-100 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5" /> Intelligent Builder
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">Build Dashboards <br /> <span className="text-indigo-600 italic">By Talking.</span></h2>
              <div className="max-w-2xl mx-auto mb-16">
                <div className={`p-4 rounded-[2.5rem] shadow-2xl border flex items-center gap-3 ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)} placeholder="Describe your dashboard (e.g., 'SaaS Revenue tracker')..." className="w-full bg-transparent border-none focus:ring-0 text-lg font-semibold outline-none" />
                  <button onClick={() => handleGenerate(prompt)} className="bg-indigo-600 text-white p-5 rounded-[1.8rem] hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"><ChevronRight className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="mt-20 text-left">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black">Quick Start Templates</h3>
                  <button onClick={() => setAppMode('templates')} className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">Explore all 50+ templates <ChevronRightIcon className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SAMPLE_TEMPLATES.slice(0, 6).map((tmpl) => (
                    <button key={tmpl.id} onClick={() => handleGenerate(tmpl.prompt)} className={`p-8 border rounded-[2.5rem] text-left hover:shadow-2xl transition-all group relative overflow-hidden ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <span className="text-8xl">{tmpl.icon}</span>
                      </div>
                      <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform origin-left">{tmpl.icon}</span>
                      <div className="text-[10px] font-black uppercase text-indigo-500 mb-1 tracking-widest">{tmpl.category}</div>
                      <h3 className="font-black text-lg mb-2">{tmpl.name}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2">{tmpl.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : dashboardData && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 pt-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => {setStep('define'); setDashboardData(null);}} className="p-3 bg-white/10 rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 dark:border-slate-800"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                      <input 
                        type="text" 
                        value={dashboardData.title} 
                        onChange={(e) => setDashboardData({...dashboardData, title: e.target.value})}
                        className="text-5xl font-black tracking-tight bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-2 -ml-2 w-full outline-none"
                      />
                    </div>
                  </div>
                  <textarea 
                    value={dashboardData.description}
                    onChange={(e) => setDashboardData({...dashboardData, description: e.target.value})}
                    rows={1}
                    className="text-slate-500 font-medium text-lg max-w-2xl bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-2 -ml-2 w-full resize-none overflow-hidden outline-none"
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                </div>
                <div className="w-full lg:w-[400px]">
                  <form onSubmit={handleUpdate} className="relative group">
                    <input type="text" value={chatCommand} onChange={(e) => setChatCommand(e.target.value)} placeholder="AI Command..." className={`relative w-full pl-14 pr-14 py-5 rounded-[1.8rem] border focus:ring-0 font-bold text-sm shadow-xl ${dashboardData.themeVariant === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                    <button type="submit" disabled={isUpdating} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl hover:scale-105 disabled:opacity-30 transition-all">
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>

              {/* Toolbar: Filters & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border dark:border-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div className="flex items-center gap-2">
                              <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs font-bold border-none p-0 focus:ring-0 text-slate-600 dark:text-slate-300 outline-none"
                              />
                              <span className="text-slate-300">to</span>
                              <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs font-bold border-none p-0 focus:ring-0 text-slate-600 dark:text-slate-300 outline-none"
                              />
                          </div>
                          {(startDate || endDate) && (
                              <button onClick={() => {setStartDate(''); setEndDate('');}} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><X className="w-3 h-3" /></button>
                          )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <Filter className="w-3 h-3" />
                         {startDate || endDate ? 'Filtered View' : 'Global Data'}
                      </div>
                  </div>
                  
                  <button 
                    onClick={addPieChartWidget}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Category Chart
                  </button>
              </div>

              <div className={`grid gap-8 ${dashboardData.layoutColumns === 1 ? 'grid-cols-1' : dashboardData.layoutColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {filteredWidgets.map((widget, idx) => (
                  <div key={widget.id} className="group">
                    <WidgetRenderer 
                        widget={{ ...widget, color: widget.color || dashboardData.themeColor }} 
                        themeVariant={dashboardData.themeVariant} 
                        onEdit={() => setEditingWidgetId(widget.id)}
                        onViewData={() => setViewingDataWidgetId(widget.id)}
                        onTitleChange={(newTitle) => updateWidget(widget.id, { title: newTitle })}
                        isPrimary={idx === 0}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {appMode === 'templates' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAppMode(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border dark:border-slate-800">
                <div className="p-8 border-b dark:border-slate-800 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><Grid className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-3xl font-black dark:text-white">Template Library</h3>
                                <p className="text-slate-400 font-bold text-sm">Choose a blueprint to generate instantly.</p>
                            </div>
                        </div>
                        <button onClick={() => setAppMode(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><X className="w-8 h-8 text-slate-400" /></button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search templates..." 
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                            {TEMPLATE_CATEGORIES.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="p-8 overflow-y-auto flex-grow bg-slate-50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(tmpl => (
                            <button 
                                key={tmpl.id} 
                                onClick={() => handleGenerate(tmpl.prompt)}
                                className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 text-left hover:shadow-xl hover:-translate-y-1 transition-all group border-slate-100"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl group-hover:scale-110 transition-transform origin-left">{tmpl.icon}</span>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-400">{tmpl.category}</span>
                                </div>
                                <h4 className="text-lg font-black dark:text-white mb-2">{tmpl.name}</h4>
                                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{tmpl.prompt}</p>
                            </button>
                        ))}
                    </div>
                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Search className="w-20 h-20 mb-4" />
                            <p className="text-xl font-bold">No templates found matching your search.</p>
                        </div>
                    )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Raw Data Viewer Modal */}
      <AnimatePresence>
        {viewingDataWidgetId && currentDataWidget && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingDataWidgetId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }} 
                    className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border dark:border-slate-800"
                >
                    <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600"><Database className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-2xl font-black dark:text-white">{currentDataWidget.title}</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Raw Dataset</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => downloadCSV(currentDataWidget)} 
                                className="flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button onClick={() => setViewingDataWidgetId(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                    </div>
                    <div className="p-8 overflow-auto flex-grow">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                <tr>
                                    {Object.keys(currentDataWidget.chartData?.[0] || {}).map(k => (
                                        <th key={k} className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentDataWidget.chartData?.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        {Object.keys(row).map(k => (
                                            <td key={k} className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{String(row[k] ?? '-')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Library Drawer */}
      <AnimatePresence>
        {appMode === 'library' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-start">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAppMode(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className={`relative w-full max-w-sm h-full shadow-2xl overflow-y-auto border-r ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="p-6 sticky top-0 bg-inherit border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-black">My Dashboards</h3>
                    <button onClick={() => setAppMode(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <button onClick={() => {setDashboardData(null); setStep('define'); setAppMode(null);}} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg"><Plus className="w-5 h-5" /> Create New</button>
                    {savedDashboards.map(dash => (
                        <div key={dash.id} onClick={() => handleLoad(dash)} className={`group p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${dashboardData?.id === dash.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2"><h4 className="font-bold truncate pr-4 text-slate-900">{dash.title}</h4><button onClick={(e) => handleDelete(dash.id!, e)} className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button></div>
                            <p className="text-xs text-slate-500 line-clamp-2">{dash.description}</p>
                        </div>
                    ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Settings Drawer */}
      <AnimatePresence>
        {appMode === 'global-settings' && dashboardData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAppMode(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`relative w-full max-w-md h-full shadow-2xl overflow-y-auto ${dashboardData.themeVariant === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="p-8 space-y-10">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-black">Dashboard Config</h3><button onClick={() => setAppMode(null)}><X className="w-6 h-6" /></button></div>
                
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest"><Monitor className="w-4 h-4" /> Visual Theme</div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['minimal', 'glass', 'neo', 'dark', 'corporate', 'colorful'] as ThemeVariant[]).map(v => (
                      <button key={v} onClick={() => setDashboardData({ ...dashboardData, themeVariant: v })} className={`p-4 rounded-2xl border-2 font-bold capitalize transition-all ${dashboardData.themeVariant === v ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}> {v} </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest"><Columns className="w-4 h-4" /> Layout Columns</div>
                  <div className="flex gap-4">
                    {[1, 2, 3].map(c => (
                      <button key={c} onClick={() => setDashboardData({ ...dashboardData, layoutColumns: c as any })} className={`flex-grow p-4 rounded-2xl border-2 font-bold transition-all ${dashboardData.layoutColumns === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'}`}> {c} Col </button>
                    ))}
                  </div>
                </section>
                <button onClick={() => setAppMode(null)} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">Apply Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Widget Editor Drawer */}
      <AnimatePresence>
        {editingWidgetId && currentEditingWidget && (
          <div className="fixed inset-0 z-[150] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingWidgetId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`relative w-full max-w-md h-full shadow-2xl overflow-y-auto ${dashboardData?.themeVariant === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="sticky top-0 bg-inherit border-b border-slate-100 z-10"><div className="flex items-center justify-between p-6"> <h3 className="text-xl font-black">Edit Widget</h3> <button onClick={() => setEditingWidgetId(null)}><X className="w-5 h-5 text-slate-400" /></button> </div>
                <div className="flex px-6 pb-2 gap-4">
                    <button onClick={() => setDrawerTab('settings')} className={`pb-3 text-sm font-bold border-b-2 ${drawerTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Settings</button>
                    <button onClick={() => setDrawerTab('data')} className={`pb-3 text-sm font-bold border-b-2 ${drawerTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Data Table</button>
                </div>
              </div>
              <div className="p-8 pb-32">
                {drawerTab === 'settings' ? (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest"><Edit3 className="w-4 h-4" /> General</div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</label>
                        <input type="text" value={currentEditingWidget.title} onChange={(e) => updateWidget(editingWidgetId, { title: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none" placeholder="Title" />
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                        <textarea value={currentEditingWidget.description || ''} onChange={(e) => updateWidget(editingWidgetId, { description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none" placeholder="Tooltip description" rows={3} />
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Widget Type</label>
                        <select value={currentEditingWidget.type} onChange={(e) => updateWidget(editingWidgetId, { type: e.target.value as WidgetType })} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
                            <option value="stat">Stat Card</option><option value="line-chart">Line Chart</option><option value="bar-chart">Bar Chart</option><option value="area-chart">Area Chart</option><option value="pie-chart">Pie Chart</option><option value="scatter-plot">Scatter Plot</option><option value="radar-chart">Radar Chart</option><option value="radial-bar-chart">Radial Bar Chart</option><option value="funnel-chart">Funnel Chart</option>
                        </select>
                      </div>
                    </section>
                    
                    {currentEditingWidget.type === 'scatter-plot' && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest"><Shapes className="w-4 h-4" /> Scatter Configuration</div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Data Point Shape</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {([
                                    { id: 'circle', icon: <Circle className="w-4 h-4" /> },
                                    { id: 'diamond', icon: <Zap className="w-4 h-4 rotate-45" /> },
                                    { id: 'star', icon: <Star className="w-4 h-4" /> },
                                    { id: 'square', icon: <Square className="w-4 h-4" /> },
                                    { id: 'triangle', icon: <Triangle className="w-4 h-4" /> },
                                    { id: 'cross', icon: <X className="w-4 h-4" /> },
                                    { id: 'wye', icon: <span className="font-black text-xs">Y</span> },
                                  ] as { id: ScatterShape; icon: React.ReactNode }[]).map((shape) => (
                                    <button 
                                      key={shape.id}
                                      onClick={() => updateWidget(editingWidgetId, { 
                                        scatterConfig: { ...(currentEditingWidget.scatterConfig || {}), shape: shape.id } 
                                      })}
                                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${currentEditingWidget.scatterConfig?.shape === shape.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                      title={shape.id}
                                    >
                                      {shape.icon}
                                      <span className="text-[8px] font-black uppercase">{shape.id}</span>
                                    </button>
                                  ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {currentEditingWidget.type !== 'stat' && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest"><Settings2 className="w-4 h-4" /> Visualization</div>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"> 
                                <span className="text-xs font-black uppercase tracking-wider text-slate-600">Zoom & Pan</span> 
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                    checked={currentEditingWidget.enableZoom || false} 
                                    onChange={(e) => updateWidget(editingWidgetId, { enableZoom: e.target.checked })} 
                                /> 
                           </div>
                           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"> 
                                <span className="text-xs font-black uppercase tracking-wider text-slate-600">Trendline</span> 
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                    checked={currentEditingWidget.showTrendline || false} 
                                    onChange={(e) => updateWidget(editingWidgetId, { showTrendline: e.target.checked })} 
                                /> 
                           </div>
                           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"> 
                                <span className="text-xs font-black uppercase tracking-wider text-slate-600">Data Labels</span> 
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                    checked={currentEditingWidget.showDataLabels || false} 
                                    onChange={(e) => updateWidget(editingWidgetId, { showDataLabels: e.target.checked })} 
                                /> 
                           </div>
                        </div>
                      </section>
                    )}
                    <button onClick={() => { if(dashboardData){ setDashboardData({...dashboardData, widgets: dashboardData.widgets.filter(w => w.id !== editingWidgetId)}); setEditingWidgetId(null); }}} className="w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl flex items-center justify-center gap-2 border border-transparent hover:border-rose-100 transition-all active:scale-95"><Trash2 className="w-5 h-5" /> Delete Widget</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentEditingWidget.type === 'stat' ? <div className="p-6 bg-slate-50 text-center rounded-2xl font-bold text-slate-500">Stat widgets use single values. Edit in Settings.</div> : (
                       <DataTableEditor data={currentEditingWidget.chartData || []} onChange={(newData) => updateWidget(editingWidgetId, { chartData: newData })} />
                    )}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-inherit border-t"><button onClick={() => setEditingWidgetId(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">Save & Exit</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md px-6"><div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-slate-800"><div className="bg-rose-500 p-2 rounded-xl"><AlertCircle className="w-5 h-5" /></div><p className="flex-grow font-bold text-sm">{error}</p><button onClick={() => setError(null)}><X className="w-5 h-5" /></button></div></motion.div>}</AnimatePresence>
    </div>
  );
};

export default App;
