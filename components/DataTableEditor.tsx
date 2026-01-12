
import React, { useState, useEffect } from 'react';
import { ChartDataItem } from '../types';
import { Plus, Trash2, Download, Wand2, Loader2, Check } from 'lucide-react';
import { generateMockData } from '../geminiService';

interface DataTableEditorProps {
  data: ChartDataItem[];
  onChange: (newData: ChartDataItem[]) => void;
}

export const DataTableEditor: React.FC<DataTableEditorProps> = ({ data, onChange }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      const keys = new Set<string>();
      if (data.some(d => d.name !== undefined)) keys.add('name');
      if (data.some(d => d.category !== undefined)) keys.add('category');
      data.forEach(item => Object.keys(item).forEach(k => keys.add(k)));
      const orderedKeys = Array.from(keys).sort((a, b) => {
        const priority = ['name', 'category', 'value', 'x', 'y', 'z'];
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      setColumns(orderedKeys);
    } else {
      setColumns(['name', 'value']);
    }
  }, [data]);

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    const originalValue = newData[rowIndex][key];
    const isNumber = typeof originalValue === 'number' || (key !== 'name' && key !== 'category' && !isNaN(Number(value)) && value.trim() !== '');
    newData[rowIndex] = { ...newData[rowIndex], [key]: isNumber ? (value === '' ? 0 : Number(value)) : value };
    onChange(newData);
  };

  const handleAddRow = () => {
    const newRow: ChartDataItem = { name: 'New Item', value: 0 };
    columns.forEach(col => {
        if (col !== 'name' && col !== 'value') {
            if (['x', 'y', 'z'].includes(col)) newRow[col] = 0;
            else newRow[col] = '';
        }
    });
    onChange([...data, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleAiRefill = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newData = await generateMockData(columns, aiPrompt);
      onChange(newData);
      setShowAiInput(false);
      setAiPrompt('');
    } catch (err) {
      alert("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = columns.join(',');
    const rows = data.map(row => columns.map(col => {
      const val = row[col] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {data.length} Data Points
            </span>
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowAiInput(!showAiInput)}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${showAiInput ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-100 shadow-sm'}`}
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'AI Thinking...' : 'AI Refill'}
                </button>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
            </div>
        </div>
        
        {showAiInput && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                <input 
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiRefill()}
                    placeholder="e.g. 12 months of increasing sales..."
                    className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-100"
                />
                <button 
                    onClick={handleAiRefill}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
            </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white max-h-[400px]">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 sticky top-0 backdrop-blur z-10 border-b border-slate-100">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-black tracking-widest">
                  {col}
                </th>
              ))}
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-slate-50/30 transition-colors">
                {columns.map(col => (
                  <td key={`${rowIndex}-${col}`} className="p-1">
                    <input
                      type="text"
                      value={row[col] ?? ''}
                      onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-200 rounded px-3 py-2 text-slate-700 font-bold transition-all"
                    />
                  </td>
                ))}
                <td className="px-2">
                  <button 
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleAddRow}
        className="w-full py-4 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-2 border-dashed border-slate-200 hover:border-indigo-200 rounded-[1.5rem] transition-all"
      >
        <Plus className="w-4 h-4" />
        Append Row
      </button>
    </div>
  );
};
