import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input, TextArea, Select } from './Input';
import type { CreateItineraryRequest, Itinerary, TimeSlot, Plan } from '../types';
import { Calendar, Clock, MapPin, Car, Activity } from 'lucide-react';
import { getTimeSlotLabel } from '../utils/planUtils';

interface ItineraryFormProps {
  plan: Plan;
  initialData?: Itinerary;
  onSubmit: (data: CreateItineraryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ItineraryForm({ plan, initialData, onSubmit, onCancel, isLoading, className }: ItineraryFormProps) {
  const [formData, setFormData] = useState<CreateItineraryRequest>({
    date: plan.startDate,
    timeSlot: 'morning',
    activity: '',
    location: '',
    transportation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        timeSlot: initialData.timeSlot,
        activity: initialData.activity,
        location: initialData.location,
        transportation: initialData.transportation || '',
      });
    } else {
      setFormData({
        date: plan.startDate,
        timeSlot: 'morning',
        activity: '',
        location: '',
        transportation: '',
      });
    }
    setErrors({});
  }, [initialData, plan]);

  const timeSlotOptions: { value: TimeSlot; label: string }[] = [
    { value: 'morning', label: getTimeSlotLabel('morning') },
    { value: 'afternoon', label: getTimeSlotLabel('afternoon') },
    { value: 'evening', label: getTimeSlotLabel('evening') },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = '请选择日期';
    } else if (formData.date < plan.startDate || formData.date > plan.endDate) {
      newErrors.date = `行程日期必须在 ${plan.startDate} 至 ${plan.endDate} 之间`;
    }
    if (!formData.activity.trim()) {
      newErrors.activity = '请输入活动描述';
    }
    if (!formData.location.trim()) {
      newErrors.location = '请输入地点';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateItineraryRequest = {
      ...formData,
      transportation: formData.transportation || undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: keyof CreateItineraryRequest, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-5 bg-gray-50 rounded-2xl ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="日期"
          name="date"
          type="date"
          min={plan.startDate}
          max={plan.endDate}
          value={formData.date}
          onChange={e => handleChange('date', e.target.value)}
          error={errors.date}
          leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
        />
        <Select
          label="时间段"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={e => handleChange('timeSlot', e.target.value as TimeSlot)}
          options={timeSlotOptions}
          leftIcon={<Clock className="w-4 h-4 text-gray-400" />}
        />
      </div>

      <Input
        label="活动描述"
        name="activity"
        value={formData.activity}
        onChange={e => handleChange('activity', e.target.value)}
        error={errors.activity}
        placeholder="例如：游览清水寺"
        leftIcon={<Activity className="w-4 h-4 text-gray-400" />}
      />

      <Input
        label="地点"
        name="location"
        value={formData.location}
        onChange={e => handleChange('location', e.target.value)}
        error={errors.location}
        placeholder="例如：京都府京都市东山区"
        leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
      />

      <Input
        label="交通方式（可选）"
        name="transportation"
        value={formData.transportation}
        onChange={e => handleChange('transportation', e.target.value)}
        placeholder="例如：公交、步行、出租车..."
        leftIcon={<Car className="w-4 h-4 text-gray-400" />}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" size="sm" loading={isLoading}>
          {initialData ? '保存修改' : '添加行程'}
        </Button>
      </div>
    </form>
  );
}
