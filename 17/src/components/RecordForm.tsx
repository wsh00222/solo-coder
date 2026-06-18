import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import type { CreateRecordDto } from '../../shared/types.js';
import { getToday } from '../utils/date';

interface RecordFormProps {
  planId: number;
  onSubmit: (data: CreateRecordDto) => Promise<boolean>;
  todayRecordExists?: boolean;
  loading?: boolean;
}

export default function RecordForm({ planId, onSubmit, todayRecordExists, loading }: RecordFormProps) {
  const [formData, setFormData] = useState({
    date: getToday(),
    durationMinutes: 60,
    content: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setFormData({
      date: getToday(),
      durationMinutes: 60,
      content: '',
    });
    setErrors({});
    setShowConfirm(false);
  }, [planId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = '请选择日期';
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      newErrors.durationMinutes = '学习时长必须大于0';
    }
    if (!formData.content.trim()) {
      newErrors.content = '请输入学习内容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.date === getToday() && todayRecordExists && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      const isUpdate = await onSubmit({
        date: formData.date,
        durationMinutes: formData.durationMinutes,
        content: formData.content.trim(),
      });

      if (!isUpdate) {
        setFormData({
          date: getToday(),
          durationMinutes: 60,
          content: '',
        });
      }
      setErrors({});
      setShowConfirm(false);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : '保存失败',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-600" />
        添加学习记录
      </h3>

      {showConfirm && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">今日已有学习记录</p>
            <p className="text-yellow-600 text-sm">是否覆盖今日的学习记录？</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={(e) => handleSubmit(e)}
                className="px-3 py-1.5 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
              >
                确认覆盖
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={getToday()}
              className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.date ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              学习时长（分钟） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMinutes: parseInt(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.durationMinutes
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-200'
              }`}
            />
            {errors.durationMinutes && (
              <p className="mt-1 text-xs text-red-500">{errors.durationMinutes}</p>
            )}
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? '保存中...' : '保存记录'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            学习内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="记录今天学习了什么..."
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
              errors.content ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
            }`}
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
}
