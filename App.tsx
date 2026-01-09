
import React, { useState } from 'react';
import { 
  Plus, FileText, CheckCircle2, 
  ChevronRight, Sparkles, AlertCircle, RefreshCcw, Github, 
  Loader2, Edit3, Trash2, X, Settings2, Layout,
  MessageSquare, Send, Wand2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardData, WizardStep, DashboardWidget, WidgetType } from './types';
import { SAMPLE_TEMPLATES } from './constants';
import { generateDashboardSchema, updateDashboardSchema } from './geminiService';
import { WidgetRenderer } from './components/WidgetRenderer';
import { generateHtmlReport } from './utils/reportGenerator';

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

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('define');
  const [prompt, setPrompt] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatCommand, setChatCommand] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
      setDashboardData(updated);
      setChatCommand('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to apply changes.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Exports the dashboard as a standalone HTML report
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              Dash<span className="text-indigo-600">Gen</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {step === 'preview' && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-200"
              >
                <FileText className="w-4 h-4" />
                Export HTML
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
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">{dashboardData.title}</h2>
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
                  <WidgetRenderer 
                    key={widget.id} 
                    widget={{ ...widget, color: widget.color || dashboardData.themeColor }} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
