import { PlanModel, Plan, CreatePlanInput, UpdatePlanInput } from '../models/Plan';
import { RecordModel } from '../models/Record';
import { getWeekStart, getWeekEnd, getServerDate, addDays, diffDays } from '../utils/date';

export interface PlanWithProgress extends Plan {
  total_records: number;
  expected_total: number;
  current_week_done: number;
  current_week_target: number;
  current_week_progress: number;
}

export const PlanService = {
  getAll(goal?: string): PlanWithProgress[] {
    let plans = PlanModel.getAll();
    if (goal && goal !== 'all') {
      plans = plans.filter(p => p.goal === goal);
    }
    return plans.map(p => this.withProgress(p));
  },

  getById(id: number): PlanWithProgress | undefined {
    const plan = PlanModel.getById(id);
    if (!plan) return undefined;
    return this.withProgress(plan);
  },

  withProgress(plan: Plan): PlanWithProgress {
    const records = RecordModel.getAllByPlanId(plan.id);
    const totalRecords = records.length;

    const today = getServerDate();
    const effectiveEnd = plan.end_date && plan.end_date < today ? plan.end_date : today;
    const totalDays = Math.max(0, diffDays(plan.start_date, effectiveEnd)) + 1;
    const expectedTotal = Math.ceil((totalDays / 7) * plan.weekly_frequency);

    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);
    const weekRecords = records.filter(r => r.date >= weekStart && r.date <= weekEnd);
    const weekDone = weekRecords.length;
    const weekTarget = plan.weekly_frequency;
    const weekProgress = weekTarget > 0 ? Math.min(100, (weekDone / weekTarget) * 100) : 0;

    return {
      ...plan,
      total_records: totalRecords,
      expected_total: expectedTotal,
      current_week_done: weekDone,
      current_week_target: weekTarget,
      current_week_progress: weekProgress,
    };
  },

  create(input: CreatePlanInput): PlanWithProgress {
    const plan = PlanModel.create(input);
    return this.withProgress(plan);
  },

  update(id: number, input: UpdatePlanInput): PlanWithProgress | undefined {
    const plan = PlanModel.update(id, input);
    if (!plan) return undefined;
    return this.withProgress(plan);
  },

  remove(id: number): boolean {
    return PlanModel.remove(id);
  },

  duplicate(id: number): PlanWithProgress | undefined {
    const plan = PlanModel.getById(id);
    if (!plan) return undefined;

    const today = getServerDate();
    let newEndDate: string | null = null;
    if (plan.end_date) {
      const diff = diffDays(plan.start_date, plan.end_date);
      newEndDate = addDays(today, diff);
    }

    return this.create({
      name: `${plan.name}（副本）`,
      goal: plan.goal,
      weekly_frequency: plan.weekly_frequency,
      start_date: today,
      end_date: newEndDate,
    });
  },
};
