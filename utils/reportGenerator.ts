
import { DashboardData } from "../types";

export const generateHtmlReport = (data: DashboardData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - AI Generated Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { background-color: #f8fafc; font-family: sans-serif; }
        .card { background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="p-8">
    <div class="max-w-6xl mx-auto">
        <header class="mb-12">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">${data.title}</h1>
            <p class="text-slate-500 text-lg">${data.description}</p>
            <div class="mt-4 inline-block px-4 py-1 rounded-full text-white font-semibold" style="background-color: ${data.themeColor}">
                Generated Report
            </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${data.widgets.map(w => `
                <div class="card flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-slate-500 font-bold text-xs uppercase tracking-widest">${w.title}</h3>
                        ${w.trend ? `
                            <span class="text-xs font-bold ${w.trend.isUpward ? 'text-emerald-500' : 'text-rose-500'}">
                                ${w.trend.isUpward ? '↑' : '↓'} ${w.trend.value}%
                            </span>
                        ` : ''}
                    </div>
                    ${w.type === 'stat' ? `
                        <div class="py-4">
                            <span class="text-4xl font-bold text-slate-900">${w.value || ''}</span>
                            <span class="text-slate-400 font-medium ml-1">${w.unit || ''}</span>
                        </div>
                    ` : `
                        <div class="h-48 mt-2">
                            <canvas id="chart-${w.id}"></canvas>
                        </div>
                    `}
                </div>
            `).join('')}
        </div>

        <footer class="mt-16 pt-8 border-t border-slate-200 text-slate-400 text-sm text-center">
            AI Dashboard Builder &copy; ${new Date().getFullYear()} - Exported from Browser
        </footer>
    </div>

    <script>
        ${data.widgets.filter(w => w.type !== 'stat').map(w => `
            new Chart(document.getElementById('chart-${w.id}'), {
                type: '${w.type === 'line-chart' ? 'line' : w.type === 'bar-chart' ? 'bar' : w.type === 'pie-chart' ? 'pie' : 'line'}',
                data: {
                    labels: ${JSON.stringify(w.chartData?.map(d => d.name) || [])},
                    datasets: [{
                        label: '${w.title}',
                        data: ${JSON.stringify(w.chartData?.map(d => d.value) || [])},
                        backgroundColor: '${w.color || data.themeColor}80',
                        borderColor: '${w.color || data.themeColor}',
                        borderWidth: 2,
                        fill: ${w.type === 'area-chart' ? 'true' : 'false'},
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: ${w.type === 'pie-chart' ? 'false' : 'true'} },
                        x: { display: ${w.type === 'pie-chart' ? 'false' : 'true'} }
                    }
                }
            });
        `).join('')}
    </script>
</body>
</html>
  `;
};
