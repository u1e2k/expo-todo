// Task: Gamified TODOのタスクデータモデル
export interface Task {
  id: string;
  title: string;
  detail?: string;
  type: 'TASK' | 'PROJECT' | 'SUBTASK';
  size: 'Small' | 'Medium' | 'Large';
  isCompleted: boolean;
  dueDate: Date | null;
  priority: number; // 1-3 (1: 低, 2: 中, 3: 高)
  parentID: string | null;
  childrenIDs: string[];
  stakedPoints: number; // 未確定報酬のストック値
  createdAt: Date;
  completedAt?: Date;
  tags?: string[]; // 回復タスク、メンタルケアなどのタグ
}

// UserStatus: ユーザーステータスデータモデル
export interface UserStatus {
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  xpTotal: number;
  level: number; // 総合レベル
  levelINT: number;
  levelSpeed: number;
  intExp: number; // INT経験値
  speedExp: number; // Speed経験値
}

export type FilterType = 'all' | 'active' | 'completed' | 'project';
