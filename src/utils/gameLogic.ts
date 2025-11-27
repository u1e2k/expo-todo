import { ITask, IUserStatus } from '../types/Task';

/**
 * タスクサイズに応じた基本ポイント
 */
const SIZE_BASE_POINTS = {
  Small: 10,
  Medium: 25,
  Large: 50,
};

/**
 * 優先度ボーナス倍率
 */
const PRIORITY_MULTIPLIER = {
  1: 1.0,  // 低
  2: 1.2,  // 中
  3: 1.5,  // 高
};

/**
 * タスクの詳細設定に応じた未確定報酬をストック
 */
export const calculateStakedPoints = (task: Partial<ITask>): number => {
  let points = 0;

  // サイズによる基本ポイント
  if (task.size) {
    points += SIZE_BASE_POINTS[task.size];
  }

  // 期限設定ボーナス
  if (task.dueDate) {
    points += 5;
  }

  // 優先度設定ボーナス
  if (task.priority && task.priority > 0) {
    points += 3 * task.priority;
  }

  // サブタスク設定ボーナス（プロジェクトの場合）
  if (task.childrenIDs && task.childrenIDs.length > 0) {
    points += task.childrenIDs.length * 5;
  }

  // タグ設定ボーナス
  if (task.tags && task.tags.length > 0) {
    points += task.tags.length * 2;
  }

  return points;
};

/**
 * タスク完了時の確定報酬を計算
 */
export const calculateConfirmedReward = (
  task: ITask,
  userStatus: IUserStatus
): number => {
  const baseReward = task.stakedPoints;

  // MP依存の倍率（MP残量に応じてボーナス）
  const mpRatio = userStatus.currentMP / userStatus.maxMP;
  const mpMultiplier = 0.5 + mpRatio; // 0.5 ~ 1.5倍

  // スピードボーナス（作成から完了までの時間）
  let speedMultiplier = 1.0;
  if (task.completedAt && task.createdAt) {
    const hoursElapsed =
      (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60);
    
    // 24時間以内なら追加ボーナス
    if (hoursElapsed <= 24) {
      speedMultiplier = 1.3;
    } else if (hoursElapsed <= 72) {
      speedMultiplier = 1.1;
    }
  }

  // 優先度ボーナス
  const priorityMultiplier = PRIORITY_MULTIPLIER[task.priority as 1 | 2 | 3] || 1.0;

  return Math.floor(baseReward * mpMultiplier * speedMultiplier * priorityMultiplier);
};

/**
 * プロジェクト分解ボーナスを計算（Large→3個以上のサブタスク）
 */
export const calculateDecompositionBonus = (
  originalSize: 'Small' | 'Medium' | 'Large',
  subtaskCount: number
): number => {
  if (originalSize === 'Large' && subtaskCount >= 3) {
    return 30 + subtaskCount * 5; // 基本30pt + サブタスク数 × 5pt
  }
  if (originalSize === 'Medium' && subtaskCount >= 2) {
    return 15 + subtaskCount * 3;
  }
  return 0;
};

/**
 * HP回復量を計算（回復タスク完了時）
 */
export const calculateHPRecovery = (task: ITask): number => {
  if (!task.tags || !task.tags.includes('recovery')) {
    return 0;
  }

  const baseRecovery = SIZE_BASE_POINTS[task.size] / 2;
  return Math.floor(baseRecovery);
};

/**
 * MP回復量を計算（メンタルケアタスク完了時）
 */
export const calculateMPRecovery = (task: ITask): number => {
  if (!task.tags || !task.tags.includes('mental-care')) {
    return 0;
  }

  const baseRecovery = SIZE_BASE_POINTS[task.size] / 2;
  return Math.floor(baseRecovery);
};

/**
 * HP/MPペナルティを計算（期限切れ、タスク未完了など）
 */
export const calculatePenalty = (
  task: ITask,
  reason: 'overdue' | 'abandoned'
): { hp: number; mp: number } => {
  let hpPenalty = 0;
  let mpPenalty = 0;

  if (reason === 'overdue' && task.priority === 3) {
    // 緊急タスクの期限切れ
    hpPenalty = 15;
    mpPenalty = 10;
  } else if (reason === 'overdue') {
    hpPenalty = 5;
    mpPenalty = 5;
  } else if (reason === 'abandoned') {
    // 長期放置されたタスクの削除
    mpPenalty = 8;
  }

  return { hp: hpPenalty, mp: mpPenalty };
};

/**
 * INT経験値を加算すべきか判定
 */
export const shouldGainINTExperience = (task: ITask): boolean => {
  // 学習系タグまたはプロジェクト完了
  return (
    (task.tags && task.tags.includes('learning')) ||
    task.type === 'PROJECT'
  );
};

/**
 * Speed経験値を加算すべきか判定
 */
export const shouldGainSpeedExperience = (task: ITask): boolean => {
  if (!task.completedAt || !task.createdAt) return false;

  const hoursElapsed =
    (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60);

  // 24時間以内の完了
  return hoursElapsed <= 24;
};
