import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import type { CreatePlanRequest, Plan } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { MapPin, Calendar, Users, Wallet, FileText } from 'lucide-react';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlanRequest) => Promise<void>;
  initialData?: Plan;
  isLoading?: boolean;
}

export function PlanForm({ isOpen, onClose, onSubmit, initialData, isLoading }: PlanFormProps) {
  const today = getTodayString();
  const [formData, setFormData] = useState<CreatePlanRequest>({
    destination: '',
    startDate: '',
    endDate: '',
    companions: '',
    budget: undefined,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        destination: initialData.destination,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        companions: initialData.companions || '',
        budget: initialData.budget,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        destination: '',
        startDate: '',
        endDate: '',
        companions: '',
        budget: undefined,
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = '请输入目的地';
    }
    if (!formData.startDate) {
      newErrors.startDate = '请选择出发日期';
    }
    if (!formData.endDate) {
      newErrors.endDate = '请选择返回日期';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '返回日期不能早于出发日期';
    }
    if (formData.budget !== undefined && formData.budget !== null && formData.budget < 0) {
      newErrors.budget = '预算不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreatePlanRequest = {
      ...formData,
      companions: formData.companions || undefined,
      budget: formData.budget,
      notes: formData.notes || undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof CreatePlanRequest, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑旅行计划' : '新建旅行计划'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="目的地"
          name="destination"
          value={formData.destination}
          onChange={e => handleChange('destination', e.target.value)}
          error={errors.destination}
          placeholder="例如：京都、三亚..."
          leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="出发日期"
            name="startDate"
            type="date"
            min={today}
            value={formData.startDate}
            onChange={e => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="返回日期"
            name="endDate"
            type="date"
            min={formData.startDate || today}
            value={formData.endDate}
            onChange={e => handleChange('endDate', e.target.value)}
            error={errors.endDate}
            leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
          />
        </div>

        <Input
          label="同行伙伴（可选）"
          name="companions"
          value={formData.companions}
          onChange={e => handleChange('companions', e.target.value)}
          placeholder="例如：家人、朋友..."
          leftIcon={<Users className="w-4 h-4 text-gray-400" />}
        />

        <Input
          label="预算（可选，元）"
          name="budget"
          type="number"
          min="0"
          value={formData.budget ?? ''}
          onChange={e => handleChange('budget', e.target.value ? Number(e.target.value) : undefined)}
          error={errors.budget}
          placeholder="例如：10000"
          leftIcon={<Wallet className="w-4 h-4 text-gray-400" />}
        />

        <TextArea
          label="备注（可选）"
          name="notes"
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="记录一些旅行注意事项或想法..."
          rows={3}
          leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" loading={isLoading}>
            {initialData ? '保存修改' : '创建计划'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
