
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, FileText, CheckCircle2, 
  ChevronRight, Sparkles, AlertCircle, RefreshCcw, Github, 
  Loader2, Edit3, Trash2, X, Settings2, Layout,
  MessageSquare, Send, Wand2, ArrowLeft, MoreHorizontal,
  Box, Palette, Maximize, TrendingUp, Type, ZoomIn, Eye,
  Save, FolderOpen, Clock, ChevronRight as ChevronRightIcon,
  Table2, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardData, WizardStep, DashboardWidget, WidgetType, ScatterShape, ChartDataItem } from './types';
import { SAMPLE_TEMPLATES } from './constants';
import { generateDashboardSchema, updateDashboardSchema } from './geminiService';
import { WidgetRenderer } from './components/WidgetRenderer';
import { generateHtmlReport } from './utils/reportGenerator';
import { getSavedDashboards, saveDashboardToLibrary, deleteDashboardFromLibrary } from './utils/storage';
import { DataTableEditor } from './components/DataTableEditor';

const DashboardSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-8 px-4 space-y-8"
    >
      <div className="space-y-4 max-w-xl pt-10">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 h-[300px] animate-pulse">
            <div className="h-2 w-20 bg-slate-100 rounded mb-4"></div>
            <div className="flex-grow flex flex-col justify-center">
               <div className="h-12 w-24 bg-slate-100 rounded mb-4"></div>
               <div className="h-2 w-full bg-slate-50 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

type DrawerTab = 'settings' | 'data';

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('define');
  const [prompt, setPrompt] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatCommand, setChatCommand] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  
  // Drawer State
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('settings');

  // Persistence State
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState<DashboardData[]>([]);

  useEffect(() => {
    setSavedDashboards(getSavedDashboards());
  }, []);

  // Reset tab when closing or changing widget
  useEffect(() => {
    if (!editingWidgetId) setDrawerTab('settings');
  }, [editingWidgetId]);

  const handleSave = () => {
    if (!dashboardData) return;
    try {
      const saved = saveDashboardToLibrary(dashboardData);
      setDashboardData(saved);
      setSavedDashboards(getSavedDashboards());
      // Optional success toast here
    } catch (err) {
      setError("Failed to save dashboard.");
    }
  };

  const handleLoad = (dashboard: DashboardData) => {
    setDashboardData(dashboard);
    setStep('preview');
    setShowLibrary(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboardFromLibrary(id);
      setSavedDashboards(getSavedDashboards());
      if (dashboardData?.id === id) {
        setDashboardData(null);
        setStep('define');
      }
    }
  };

  const handleNewDashboard = () => {
    setDashboardData(null);
    setPrompt('');
    setStep('define');
    setShowLibrary(false);
  };

  // Handles initial dashboard generation
  const handleGenerate = async (p: string) => {
    if (!p.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateDashboardSchema(p);
      setDashboardData(data);
      setStep('preview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate dashboard structure.");
    } finally {
      setLoading(false);
    }
  };

  // Handles AI-driven modifications to existing dashboard
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData || !chatCommand.trim() || isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await updateDashboardSchema(dashboardData, chatCommand);
      // Preserve ID and Timestamp if they existed, though update usually implies modification
      const preservedData = {
        ...updated,
        id: dashboardData.id, 
        lastModified: dashboardData.id ? Date.now() : undefined
      };
      setDashboardData(preservedData);
      setChatCommand('');
      
      // Auto-save if it was already saved
      if (preservedData.id) {
        saveDashboardToLibrary(preservedData);
        setSavedDashboards(getSavedDashboards());
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to apply changes.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = () => {
    if (!dashboardData) return;
    try {
      const html = generateHtmlReport(dashboardData);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Export failed.");
    }
  };

  const handleBack = () => {
    setStep('define');
    setDashboardData(null);
    setPrompt('');
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    if (!dashboardData) return;
    const newData = {
      ...dashboardData,
      widgets: dashboardData.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    };
    setDashboardData(newData);
    // Auto-save logic
    if (newData.id) {
       saveDashboardToLibrary(newData);
       setSavedDashboards(getSavedDashboards());
    }
  };

  const updateScatterConfig = (id: string, updates: Partial<DashboardWidget['scatterConfig']>) => {
    const widget = dashboardData?.widgets.find(w => w.id === id);
    if (!widget) return;
    updateWidget(id, {
      scatterConfig: { ...(widget.scatterConfig || {}), ...updates }
    });
  };

  const currentEditingWidget = dashboardData?.widgets.find(w => w.id === editingWidgetId);

  // Dynamically extract keys from the widget's chart data for attribute mapping
  const availableDataKeys = useMemo(() => {
    if (!currentEditingWidget?.chartData || currentEditingWidget.chartData.length === 0) {
      return ['x', 'y', 'z', 'value', 'category'];
    }
    const keys = new Set<string>();
    ['x', 'y', 'z', 'category', 'value'].forEach(k => keys.add(k));
    
    currentEditingWidget.chartData.slice(0, 10).forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'name') keys.add(key);
      });
    });
    return Array.from(keys);
  }, [currentEditingWidget]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowLibrary(true)}>
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic hidden sm:block">
                Dash<span className="text-indigo-600">Gen</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             {dashboardData && (
               <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-100"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
             )}

            {step === 'preview' && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-200"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-600">
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </nav>

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {loading ? (
            <DashboardSkeleton key="loader" />
          ) : step === 'define' ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto pt-24 px-6 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-10 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Builder
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                Build Dashboards <br />
                <span className="text-indigo-600 italic">By Talking.</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                The fastest way to visualize your ideas. Just describe the data, 
                and let AI generate a stunning dashboard for you.
              </p>

              <div className="max-w-2xl mx-auto mb-16">
                <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 flex items-center gap-3">
                  <div className="flex-grow pl-4">
                    <input 
                      type="text" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)}
                      placeholder="e.g. A crypto portfolio tracker with real-time stats..."
                      className="w-full bg-transparent border-none focus:ring-0 text-lg font-semibold placeholder:text-slate-300"
                    />
                  </div>
                  <button 
                    onClick={() => handleGenerate(prompt)}
                    disabled={!prompt.trim()}
                    className="bg-indigo-600 text-white p-5 rounded-[1.8rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleGenerate(tmpl.prompt)}
                    className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group"
                  >
                    <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform origin-left">{tmpl.icon}</span>
                    <h3 className="font-black text-slate-900 text-lg mb-2">{tmpl.name}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      Click to generate a full {tmpl.name.toLowerCase()} view.
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : dashboardData && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-6 pt-12"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-5xl font-black text-slate-900 tracking-tight">{dashboardData.title}</h2>
                      {dashboardData.lastModified && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Last saved: {new Date(dashboardData.lastModified).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium text-lg max-w-2xl">{dashboardData.description}</p>
                </div>

                <div className="w-full lg:w-[400px]">
                  <form onSubmit={handleUpdate} className="relative group">
                    <div className="absolute inset-0 bg-indigo-600 rounded-3xl blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
                    <input 
                      type="text"
                      value={chatCommand}
                      onChange={(e) => setChatCommand(e.target.value)}
                      placeholder="Modify this dashboard..."
                      className="relative w-full bg-white pl-14 pr-14 py-5 rounded-[1.8rem] border border-slate-200 focus:ring-0 focus:border-indigo-400 transition-all font-bold text-sm shadow-xl shadow-slate-200/50"
                    />
                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                    <button 
                      type="submit"
                      disabled={isUpdating || !chatCommand.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-2xl hover:scale-105 disabled:opacity-30 transition-all"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dashboardData.widgets.map((widget) => (
                  <div key={widget.id} className="relative group">
                    <WidgetRenderer 
                      widget={{ ...widget, color: widget.color || dashboardData.themeColor }} 
                    />
                    <button 
                      onClick={() => setEditingWidgetId(widget.id)}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings2 className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Library Drawer */}
      <AnimatePresence>
        {showLibrary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-start">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLibrary(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl overflow-y-auto border-r border-slate-100"
            >
              <div className="p-6 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black tracking-tight">My Dashboards</h3>
                  <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                <button 
                  onClick={handleNewDashboard}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  Create New
                </button>
              </div>

              <div className="p-4 space-y-4">
                {savedDashboards.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No saved dashboards yet.</p>
                  </div>
                ) : (
                  savedDashboards.map((dash) => (
                    <div 
                      key={dash.id}
                      onClick={() => handleLoad(dash)}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${dashboardData?.id === dash.id ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-100'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-slate-900 truncate pr-4">{dash.title}</h4>
                         <button 
                            onClick={(e) => handleDelete(dash.id!, e)}
                            className="p-1.5 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 font-medium">{dash.description}</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                           <Clock className="w-3 h-3" />
                           {new Date(dash.lastModified || Date.now()).toLocaleDateString()}
                         </div>
                         <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ChevronRightIcon className="w-3 h-3" />
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Widget Customization Drawer/Overlay */}
      <AnimatePresence>
        {editingWidgetId && currentEditingWidget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingWidgetId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 border-b border-slate-100">
                <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="text-xl font-black tracking-tight">Customize Widget</h3>
                    <button onClick={() => setEditingWidgetId(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex px-6 pb-2 gap-4">
                    <button 
                        onClick={() => setDrawerTab('settings')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${drawerTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Settings
                    </button>
                    <button 
                        onClick={() => setDrawerTab('data')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${drawerTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Table2 className="w-4 h-4" />
                        Data Editor
                    </button>
                </div>
              </div>

              <div className="p-8 pb-32">
                {drawerTab === 'settings' ? (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Edit3 className="w-4 h-4" />
                        <label className="text-xs font-black uppercase tracking-widest">General Settings</label>
                      </div>
                      <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block ml-1">Title</label>
                            <input 
                            type="text" 
                            value={currentEditingWidget.title} 
                            onChange={(e) => updateWidget(editingWidgetId, { title: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-indigo-100"
                            placeholder="Widget Title"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block ml-1">Type</label>
                            <select 
                            value={currentEditingWidget.type}
                            onChange={(e) => updateWidget(editingWidgetId, { type: e.target.value as WidgetType })}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-indigo-100 appearance-none"
                            >
                            <option value="stat">Stat Card</option>
                            <option value="line-chart">Line Chart</option>
                            <option value="bar-chart">Bar Chart</option>
                            <option value="area-chart">Area Chart</option>
                            <option value="pie-chart">Pie Chart</option>
                            <option value="scatter-plot">Scatter Plot</option>
                            <option value="radar-chart">Radar Chart</option>
                            <option value="radial-bar-chart">Radial Bar Chart</option>
                            <option value="funnel-chart">Funnel Chart</option>
                            </select>
                        </div>
                      </div>
                    </section>

                    {currentEditingWidget.type !== 'stat' && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Settings2 className="w-4 h-4" />
                          <label className="text-xs font-black uppercase tracking-widest">Chart Options</label>
                        </div>
                        
                        <div className="space-y-4">
                          {['line-chart', 'bar-chart', 'area-chart', 'scatter-plot'].includes(currentEditingWidget.type) && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <ZoomIn className="w-4 h-4 text-indigo-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">Enable Zoom & Pan</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={currentEditingWidget.enableZoom || false}
                                  onChange={(e) => updateWidget(editingWidgetId, { enableZoom: e.target.checked })}
                                  className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                              </label>
                            </div>
                          )}

                          {['line-chart', 'bar-chart', 'area-chart', 'funnel-chart', 'pie-chart', 'scatter-plot', 'radar-chart', 'radial-bar-chart'].includes(currentEditingWidget.type) && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <Eye className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">Show Data Labels</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={currentEditingWidget.showDataLabels || false}
                                  onChange={(e) => updateWidget(editingWidgetId, { showDataLabels: e.target.checked })}
                                  className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                              </label>
                            </div>
                          )}

                          {['line-chart', 'area-chart'].includes(currentEditingWidget.type) && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <TrendingUp className="w-4 h-4 text-rose-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">Show Trendline</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={currentEditingWidget.showTrendline || false}
                                  onChange={(e) => updateWidget(editingWidgetId, { showTrendline: e.target.checked })}
                                  className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                              </label>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Axis Configuration */}
                    {['line-chart', 'bar-chart', 'area-chart', 'scatter-plot'].includes(currentEditingWidget.type) && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Type className="w-4 h-4" />
                          <label className="text-xs font-black uppercase tracking-widest">Axis Labels</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block ml-1">X-Axis Label</label>
                            <input 
                              type="text" 
                              value={currentEditingWidget.xAxisLabel || ''} 
                              onChange={(e) => updateWidget(editingWidgetId, { xAxisLabel: e.target.value })}
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
                              placeholder="e.g. Month"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block ml-1">Y-Axis Label</label>
                            <input 
                              type="text" 
                              value={currentEditingWidget.yAxisLabel || ''} 
                              onChange={(e) => updateWidget(editingWidgetId, { yAxisLabel: e.target.value })}
                              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
                              placeholder="e.g. Revenue ($)"
                            />
                          </div>
                        </div>
                      </section>
                    )}

                    {currentEditingWidget.type === 'scatter-plot' && (
                      <section className="space-y-5 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-500 mb-2">
                            <Box className="w-4 h-4" />
                            <label className="text-xs font-black uppercase tracking-widest">Scatter Configuration</label>
                        </div>
                        
                        <div className="space-y-5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-2 block">Point Shape</label>
                            <div className="grid grid-cols-4 gap-2">
                              {['circle', 'square', 'diamond', 'star', 'triangle', 'wye', 'cross'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateScatterConfig(editingWidgetId, { shape: s as ScatterShape })}
                                  className={`p-3 rounded-2xl flex items-center justify-center transition-all ${currentEditingWidget.scatterConfig?.shape === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-200 hover:text-indigo-500'}`}
                                  title={s}
                                >
                                    {s === 'circle' && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                    {s === 'square' && <div className="w-2.5 h-2.5 bg-current rounded-[1px]" />}
                                    {s === 'diamond' && <div className="w-2.5 h-2.5 bg-current rotate-45 rounded-[1px]" />}
                                    {s === 'star' && <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                                    {s === 'triangle' && <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><polygon points="12 4 22 20 2 20" /></svg>}
                                    {s === 'wye' && <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth="3" strokeLinecap="round"><path d="M12 22v-8m0 0l-5-5m5 5l5-5" /></svg>}
                                    {s === 'cross' && <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Maximize className="w-3 h-3 text-slate-400" />
                                    <label className="text-[10px] font-bold text-slate-500">Size Attribute</label>
                                </div>
                                <select 
                                value={currentEditingWidget.scatterConfig?.sizeKey || ''}
                                onChange={(e) => updateScatterConfig(editingWidgetId, { sizeKey: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-100"
                                >
                                <option value="">Fixed Size</option>
                                {availableDataKeys.map(k => (
                                    <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                                ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Palette className="w-3 h-3 text-slate-400" />
                                    <label className="text-[10px] font-bold text-slate-500">Color Attribute</label>
                                </div>
                                <select 
                                value={currentEditingWidget.scatterConfig?.colorKey || ''}
                                onChange={(e) => updateScatterConfig(editingWidgetId, { colorKey: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-100"
                                >
                                <option value="">Single Color</option>
                                {availableDataKeys.map(k => (
                                    <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                                ))}
                                </select>
                            </div>
                          </div>
                          
                          {currentEditingWidget.scatterConfig?.sizeKey && (
                            <div className="pt-2 border-t border-indigo-100">
                              <label className="text-[10px] font-bold text-slate-500 mb-2 block">Size Range (px)</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="number" 
                                  value={currentEditingWidget.scatterConfig?.sizeRange?.[0] || 50}
                                  onChange={(e) => updateScatterConfig(editingWidgetId, { sizeRange: [parseInt(e.target.value), currentEditingWidget.scatterConfig?.sizeRange?.[1] || 250] })}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-center"
                                />
                                <span className="text-slate-300 font-bold">-</span>
                                <input 
                                  type="number" 
                                  value={currentEditingWidget.scatterConfig?.sizeRange?.[1] || 250}
                                  onChange={(e) => updateScatterConfig(editingWidgetId, { sizeRange: [currentEditingWidget.scatterConfig?.sizeRange?.[0] || 50, parseInt(e.target.value)] })}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-center"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    <button 
                      onClick={() => {
                        if (dashboardData) {
                          const newData = {
                            ...dashboardData,
                            widgets: dashboardData.widgets.filter(w => w.id !== editingWidgetId)
                          };
                          setDashboardData(newData);
                          if (newData.id) {
                            saveDashboardToLibrary(newData);
                            setSavedDashboards(getSavedDashboards());
                          }
                          setEditingWidgetId(null);
                        }
                      }}
                      className="w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Widget
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentEditingWidget.type === 'stat' ? (
                       <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-200">
                           <p className="text-sm font-bold text-slate-500 mb-2">Stat widgets have single values.</p>
                           <p className="text-xs text-slate-400">Edit the value directly in the "General Settings" tab using the value field.</p>
                       </div>
                    ) : (
                       <DataTableEditor 
                        data={currentEditingWidget.chartData || []} 
                        onChange={(newData) => updateWidget(editingWidgetId, { chartData: newData })} 
                       />
                    )}
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={() => setEditingWidgetId(null)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
          >
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-slate-800">
              <div className="bg-rose-500 p-2 rounded-xl">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-sm tracking-tight">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
