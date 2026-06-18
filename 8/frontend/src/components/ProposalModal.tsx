import React, { useState, useEffect } from 'react';
import { CreateProposalRequest, UpdateProposalRequest, Proposal } from '../types';
import { getDefaultDeadline } from '../utils/date';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProposalRequest | UpdateProposalRequest) => void;
  proposal?: Proposal | null;
  mode: 'create' | 'edit';
}

const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  proposal,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposer: '',
    deadline: '',
    attachmentUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && proposal) {
      setFormData({
        title: proposal.title,
        description: proposal.description,
        proposer: proposal.proposer,
        deadline: proposal.deadline.slice(0, 16),
        attachmentUrl: proposal.attachmentUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        proposer: '',
        deadline: getDefaultDeadline(),
        attachmentUrl: '',
      });
    }
    setErrors({});
  }, [mode, proposal, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入提案标题';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入提案描述';
    }
    if (mode === 'create' && !formData.proposer.trim()) {
      newErrors.proposer = '请输入提案人姓名';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData: CreateProposalRequest | UpdateProposalRequest = mode === 'create'
      ? {
          title: formData.title,
          description: formData.description,
          proposer: formData.proposer,
          deadline: formData.deadline || undefined,
          attachmentUrl: formData.attachmentUrl || undefined,
        }
      : {
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline || undefined,
        };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? '创建新提案' : '编辑提案'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提案标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入提案标题"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提案人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.proposer}
                onChange={(e) => setFormData({ ...formData, proposer: e.target.value })}
                placeholder="请输入您的姓名"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.proposer ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
              />
              {errors.proposer && (
                <p className="mt-1 text-sm text-red-500">{errors.proposer}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请详细描述您的提案内容..."
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              截止日期 {mode === 'create' && <span className="text-gray-400 font-normal">(默认为7天后)</span>}
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              附件链接 <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <input
              type="url"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium"
            >
              {mode === 'create' ? '创建提案' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
