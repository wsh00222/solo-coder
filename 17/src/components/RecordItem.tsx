import { useState } from 'react';
import { Clock, Pencil, Trash2, Calendar } from 'lucide-react';
import type { Record, UpdateRecordDto } from '../../shared/types.js';
import { formatDateCN, formatDuration, isTodayDate } from '../utils/date';

interface RecordItemProps {
  record: Record;
  isNew?: boolean;
  onUpdate: (data: UpdateRecordDto) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function RecordItem({ record, isNew, onUpdate, onDelete }: RecordItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    durationMinutes: record.durationMinutes,
    content: record.content,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editData.durationMinutes || editData.durationMinutes <= 0) return;
    if (!editData.content.trim()) return;

    setLoading(true);
    try {
      await onUpdate({
        durationMinutes: editData.durationMinutes,
        content: editData.content.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl border border-slate-100 shadow-sm p-4 transition-all duration-300 ${
        isNew ? 'animate-highlight' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                isTodayDate(record.date)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {formatDateCN(record.date)}
              {isTodayDate(record.date) && ' (今天)'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              {formatDuration(record.durationMinutes)}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-32">
                  <label className="block text-xs text-slate-500 mb-1">时长（分钟）</label>
                  <input
                    type="number"
                    min="1"
                    value={editData.durationMinutes}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        durationMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">学习内容</label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      durationMinutes: record.durationMinutes,
                      content: record.content,
                    });
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 leading-relaxed">{record.content}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function RecordList({
  records,
  newRecordId,
  onUpdateRecord,
  onDeleteRecord,
  loading,
}: {
  records: Record[];
  newRecordId: number | null;
  onUpdateRecord: (recordId: number, data: UpdateRecordDto) => Promise<void>;
  onDeleteRecord: (recordId: number) => Promise<void>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
        <div className="w-16 h-16 mx-auto mb-3 bg-slate-50 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-600 mb-1">暂无学习记录</h3>
        <p className="text-slate-400 text-sm">添加你的第一条学习记录吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <RecordItem
          key={record.id}
          record={record}
          isNew={record.id === newRecordId}
          onUpdate={(data) => onUpdateRecord(record.id, data)}
          onDelete={() => onDeleteRecord(record.id)}
        />
      ))}
    </div>
  );
}
