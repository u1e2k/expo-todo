export interface Task {
  id: string;
  title: string;
  detail: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate?: string;
}

export type FilterType = 'all' | 'active' | 'completed';
