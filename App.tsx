
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, LayoutDashboard, FileText, Download, CheckCircle2, 
  ChevronRight, Sparkles, AlertCircle, RefreshCcw, Github, 
  Loader2, Edit3, Trash2, Save, X, Settings2, BrainCircuit,
  MessageSquare, Send, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardData, WizardStep, DashboardWidget, WidgetType } from './types';
import { SAMPLE_TEMPLATES } from './constants';
import { generateDashboardSchema, updateDashboardSchema } from './geminiService';
import { WidgetRenderer } from './components/WidgetRenderer';
import { generateHtmlReport } from './utils/reportGenerator';

const DashboardSkeleton = () => {
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your request...");
  const messages = [
    "Analyzing your request...",
    "Defining optimal metrics...",
    "Architecting layout schema...",
    "Generating realistic sample data...",
    "Applying theme styles...",
    "Finalizing dashboard structure..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-8 px-4 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 w-full max-w-xl">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex items-center justify-center py-4 gap-3 text-blue-600 font-medium">
        <Loader2 className="animate-spin" size={20} />
        <motion.span
          key={loadingMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          {loadingMessage}
        </motion.span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-100 rounded"></div>
              <div className="h-5 w-12 bg-slate-50 rounded-full"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-10 w-20 bg-slate-200 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-24 w-full bg-slate-50 rounded-lg mt-4"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('define');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  
  // AI Agent States
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await generateDashboardSchema(finalPrompt);
      setDashboardData(data);
      setStep('preview');
    } catch (err) {
      console.error(err);
      setError("Failed to generate dashboard. Check your internet or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentCommand = async () => {
    if (!agentInput.trim() || !dashboardData) return;
    
    setIsAgentLoading(true);
    const command = agentInput;
    setAgentInput('');
    
    try {
      const updatedData = await updateDashboardSchema(dashboardData, command);
      setDashboardData(updatedData);
    } catch (err) {
      console.error("Agent Error:", err);
      setError("The AI agent encountered an issue applying your changes.");
    } finally {
      setIsAgentLoading(false);
    }
  };

  const handleDownload = (format: 'html' | 'json') => {
    if (!dashboardData) return;
    let content = '';
    let type = '';
    let ext = '';

    if (format === 'html') {
      content = generateHtmlReport(dashboardData);
      type = 'text/html';
      ext = 'html';
    } else {
      content = JSON.stringify(dashboardData, null, 2);
      type = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardData.title.toLowerCase().replace(/\s+/g, '-')}-report.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    if (!dashboardData) return;
    setDashboardData({
      ...dashboardData,
      widgets: dashboardData.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
    setEditingWidget(null);
  };

  const removeWidget = (id: string) => {
    if (!dashboardData) return;
    setDashboardData({
      ...dashboardData,
      widgets: dashboardData.widgets.filter(w => w.id !== id)
    });
  };

  const reset = () => {
    setDashboardData(null);
    setPrompt('');
    setStep('define');
    setIsAgentOpen(false);
  };

  const renderDefine = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-12 py-8 px-4"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-block p-2 bg-blue-50 text-blue-600 rounded-2xl mb-2"
        >
          <BrainCircuit size={32} />
        </motion.div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          AI Dashboard <span className="text-blue-600">Builder</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Turn your ideas into a fully functional data visualization interface in seconds.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            Project Brief
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A high-performance dashboard for a fitness app tracking calories, steps, heart rate trends, and weekly goals."
            className="w-full h-40 p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-lg text-slate-800"
          />
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Sparkles size={24} />
              Build my Dashboard
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-center text-slate-400 font-semibold uppercase tracking-widest text-sm">Or start from a template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TEMPLATES.map((tmpl, idx) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setPrompt(tmpl.prompt);
                handleGenerate(tmpl.prompt);
              }}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 text-left transition-all group relative overflow-hidden"
            >
              <div className="text-3xl mb-3">{tmpl.icon}</div>
              <div className="font-bold text-slate-800 mb-1 group-hover:text-blue-600">{tmpl.name}</div>
              <div className="text-sm text-slate-500 line-clamp-2">{tmpl.prompt}</div>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-blue-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-3 border border-rose-100">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );

  const renderPreview = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-8 px-4 space-y-8 relative"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={reset}
            className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold transition-colors"
          >
            ← Back to Editor
          </button>
          <h1 className="text-4xl font-black text-slate-900 group flex items-center gap-2">
            {dashboardData?.title}
            <Edit3 size={18} className="text-slate-300 group-hover:text-blue-400 cursor-pointer" />
          </h1>
          <p className="text-slate-500 max-w-2xl">{dashboardData?.description}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            Regenerate
          </button>
          <button
            onClick={() => setStep('export')}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Confirm & Export
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {dashboardData?.widgets.map((widget) => (
            <motion.div 
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <WidgetRenderer widget={widget} />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingWidget(widget.id)}
                  className="p-2 bg-white/80 backdrop-blur shadow-sm border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => removeWidget(widget.id)}
                  className="p-2 bg-white/80 backdrop-blur shadow-sm border border-slate-200 rounded-lg text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {editingWidget === widget.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur z-10 p-6 rounded-2xl flex flex-col justify-between border-2 border-blue-400">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800">Edit Widget</h4>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                      <input 
                        type="text" 
                        defaultValue={widget.title}
                        onBlur={(e) => updateWidget(widget.id, { title: e.target.value })}
                        className="w-full border-b border-slate-200 p-1 text-slate-800 focus:border-blue-400 outline-none"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chart Type</label>
                      <select 
                        defaultValue={widget.type}
                        onChange={(e) => updateWidget(widget.id, { type: e.target.value as WidgetType })}
                        className="w-full border-b border-slate-200 p-1 text-slate-800 focus:border-blue-400 outline-none"
                      >
                        <option value="stat">Stat</option>
                        <option value="line-chart">Line Chart</option>
                        <option value="bar-chart">Bar Chart</option>
                        <option value="area-chart">Area Chart</option>
                        <option value="pie-chart">Pie Chart</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingWidget(null)}
                      className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm"
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => setEditingWidget(null)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const newId = `w-${Date.now()}`;
            setDashboardData(prev => prev ? {
              ...prev,
              widgets: [...prev.widgets, { id: newId, title: "New Metric", type: 'stat', value: "0", unit: "%" }]
            } : null);
            setEditingWidget(newId);
          }}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all h-[280px]"
        >
          <Plus size={32} />
          <span className="font-bold">Add Widget</span>
        </motion.button>
      </div>

      {/* AI Agent Chat Interface */}
      <div className="fixed bottom-6 left-6 z-[60]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAgentOpen(!isAgentOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isAgentOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white animate-bounce-slow'}`}
        >
          {isAgentOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>

        <AnimatePresence>
          {isAgentOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
              className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center gap-2">
                <Wand2 size={18} className="text-blue-400" />
                <span className="font-bold text-sm">AI Design Agent</span>
              </div>
              
              <div className="p-4 bg-slate-50 text-[11px] text-slate-500 italic">
                Ask me to add metrics, change colors, or update the dashboard title.
              </div>

              <div className="p-4 space-y-3 max-h-40 overflow-y-auto">
                {isAgentLoading && (
                  <div className="flex gap-2 text-blue-600 items-center text-xs font-medium animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    Updating dashboard...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-100 flex gap-2 items-center bg-white">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAgentCommand()}
                  placeholder="e.g. Add a widget for User Growth"
                  className="flex-1 text-xs border-none focus:ring-0 outline-none py-2 px-1 text-slate-800"
                  disabled={isAgentLoading}
                />
                <button
                  onClick={handleAgentCommand}
                  disabled={isAgentLoading || !agentInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-200 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderExport = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto py-16 px-4 space-y-12"
    >
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mb-4"
        >
          <CheckCircle2 size={64} />
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900">Architecture Complete</h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto">
          Your dashboard is ready to be deployed. Download the artifacts below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">HTML Report</h3>
            <p className="text-sm text-slate-500 mt-2">Standalone dashboard with interactive charts and embedded styling.</p>
          </div>
          <button
            onClick={() => handleDownload('html')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            <Download size={20} />
            Download HTML
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6"
        >
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Settings2 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Schema JSON</h3>
            <p className="text-sm text-slate-500 mt-2">Pure data structure if you want to integrate this with your own frontend.</p>
          </div>
          <button
            onClick={() => handleDownload('json')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200"
          >
            <Download size={20} />
            Download JSON
          </button>
        </motion.div>
      </div>

      <div className="text-center pt-8">
        <button onClick={reset} className="text-slate-400 font-bold hover:text-blue-600 transition-colors">
          Start Over / Create New
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-20 selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">D</div>
            <span className="font-black text-slate-800 tracking-tight text-xl">DASHBuilder</span>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-50 px-1 py-1 rounded-full border border-slate-200">
            {['define', 'preview', 'export'].map((s, idx) => (
              <button 
                key={s}
                className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${step === s ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                onClick={() => {
                  if (s === 'define' || dashboardData) setStep(s as WizardStep);
                }}
                disabled={s !== 'define' && !dashboardData && !isLoading}
              >
                {idx + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" className="text-slate-400 hover:text-slate-600">
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <DashboardSkeleton key="loading" />
          ) : (
            <motion.div key={step}>
              {step === 'define' && renderDefine()}
              {step === 'preview' && renderPreview()}
              {step === 'export' && renderExport()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-800">
        <Sparkles size={14} className="text-amber-400" />
        AI Engine Active
      </footer>
    </div>
  );
};

export default App;
