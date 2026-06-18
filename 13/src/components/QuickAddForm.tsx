import { useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { StarRating } from './StarRating';
import { getToday } from '../utils';

interface QuickAddFormProps {
  onClose: () => void;
  onSubmit: (data: { date: string; duration: number; content: string; feeling: number | null }) => void;
  todayRecordExisted: boolean;
  defaultDate?: string;
}

export function QuickAddForm({ onClose, onSubmit, todayRecordExisted, defaultDate }: QuickAddFormProps) {
  const [date, setDate] = useState(defaultDate || getToday());
  const [duration, setDuration] = useState(60);
  const [content, setContent] = useState('');
  const [feeling, setFeeling] = useState<number | null>(null);
  const [showCover, setShowCover] = useState(false);

  function handleSubmit(force = false) {
    if (!content.trim() || !date) return;
    if (!force && date === getToday() && todayRecordExisted) {
      setShowCover(true);
      return;
    }
    onSubmit({ date, duration: Number(duration), content: content.trim(), feeling });
  }

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-lg animate-modal-in">
      {showCover && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-10">
          <div className="text-center max-w-xs">
            <div className="text-lg font-bold text-gray-800 mb-2">今日已记录</div>
            <p className="text-sm text-gray-600 mb-5">是否覆盖今日已有的训练记录？</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCover(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600"
              >
                确认覆盖
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800 text-lg">添加训练记录</h4>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">训练日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 训练时长（分钟）
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" /> 训练内容
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
            placeholder="例如：卧推4组x10次，深蹲5组x8次..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">主观感受（可选）</label>
          <StarRating rating={feeling} size="lg" interactive onChange={setFeeling} />
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!content.trim()}
            className="px-5 py-2 rounded-lg bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
}
