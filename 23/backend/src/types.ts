export interface Activity {
  id: number;
  title: string;
  activityTime: string;
  location: string;
  deadline: string;
  maxParticipants: number;
  description: string;
  createdAt: string;
}

export interface Registration {
  id: number;
  activityId: number;
  name: string;
  phone: string;
  email: string | null;
  checkedIn: number;
  createdAt: string;
}

export type ActivityStatus = 'registering' | 'closed' | 'ended';

export interface ActivityWithStats extends Activity {
  currentCount: number;
  status: ActivityStatus;
}

export interface RegistrationWithActivity extends Registration {
  activityTitle: string;
}
