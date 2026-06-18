import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TrendDataPoint } from '../../shared/types.js';
import { formatDateShort } from '../utils/date';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface LineChartProps {
  data: TrendDataPoint[];
  title?: string;
}

export default function LineChart({ data, title = '学习时长趋势' }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {title}
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 bg-slate-50 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">暂无数据</h3>
          <p className="text-slate-400 text-sm">近30天无学习记录，开始记录学习吧！</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => formatDateShort(d.date)),
    datasets: [
      {
        label: '学习时长（分钟）',
        data: data.map((d) => d.minutes),
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        borderColor: '#334155',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            if (hours > 0) {
              return `学习 ${hours}小时${minutes}分钟`;
            }
            return `学习 ${minutes}分钟`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: (value: any) => {
            if (value >= 60) {
              const hours = Math.floor(value / 60);
              return `${hours}h`;
            }
            return `${value}m`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        {title}
      </h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
