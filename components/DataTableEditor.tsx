
import React, { useState, useEffect, useMemo } from 'react';
import { ChartDataItem } from '../types';
import { Plus, Trash2, Download, Save, RotateCcw } from 'lucide-react';

interface DataTableEditorProps {
  data: ChartDataItem[];
  onChange: (newData: ChartDataItem[]) => void;
}

export const DataTableEditor: React.FC<DataTableEditorProps> = ({ data, onChange }) => {
  // Local state to manage edits before parent update, though we propagate changes immediately for responsiveness
  // or we could batch them. For this UI, immediate updates feel snappier.
  
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      // Extract all unique keys from all data items, prioritizing 'name' and 'value'
      const keys = new Set<string>();
      // Always put name/category first if they exist
      if (data.some(d => d.name !== undefined)) keys.add('name');
      if (data.some(d => d.category !== undefined)) keys.add('category');
      
      data.forEach(item => {
        Object.keys(item).forEach(k => keys.add(k));
      });
      
      // Ensure 'value' comes after descriptive keys but before technical ones like x/y if possible
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
      // Default columns if empty
      setColumns(['name', 'value']);
    }
  }, [data]);

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    // Check if the original value was a number to maintain type consistency
    const originalValue = newData[rowIndex][key];
    const isNumber = typeof originalValue === 'number' || (key !== 'name' && key !== 'category' && !isNaN(Number(value)) && value.trim() !== '');

    if (isNumber) {
        newData[rowIndex] = { ...newData[rowIndex], [key]: value === '' ? 0 : Number(value) };
    } else {
        newData[rowIndex] = { ...newData[rowIndex], [key]: value };
    }
    onChange(newData);
  };

  const handleAddRow = () => {
    const newRow: ChartDataItem = { name: 'New Item', value: 0 };
    // Pre-populate other columns with defaults if they exist
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

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const val = row[col] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {data.length} Rows
        </span>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-bold whitespace-nowrap">
                  {col}
                </th>
              ))}
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-slate-50/50 transition-colors">
                {columns.map(col => (
                  <td key={`${rowIndex}-${col}`} className="p-2">
                    <input
                      type="text"
                      value={row[col] ?? ''}
                      onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 rounded px-2 py-1 text-slate-700 font-medium transition-all"
                    />
                  </td>
                ))}
                <td className="px-2">
                  <button 
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleAddRow}
        className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-dashed border-slate-300 hover:border-indigo-200 rounded-xl transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </button>
    </div>
  );
};
