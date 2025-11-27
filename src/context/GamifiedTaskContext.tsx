import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';
import { useUserStatus } from './UserStatusContext';
import {
  calculateStakedPoints,
  calculateConfirmedReward,
  calculateDecompositionBonus,
  calculateHPRecovery,
  calculateMPRecovery,
  shouldGainINTExperience,
  shouldGainSpeedExperience,
} from '../utils/gameLogic';

interface GamifiedTaskContextType {
  tasks: Task[];
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  promoteToProject: (id: string) => void;
  demoteToTask: (id: string) => void;
  addSubtask: (parentId: string, subtask: Partial<Task>) => void;
  getTasksByType: (type: 'TASK' | 'PROJECT' | 'SUBTASK') => Task[];
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
}

const STORAGE_KEY = '@gamified_todo:tasks';

const GamifiedTaskContext = createContext<GamifiedTaskContextType | undefined>(undefined);

export const useGamifiedTasks = () => {
  const context = useContext(GamifiedTaskContext);
  if (!context) {
    throw new Error('useGamifiedTasks must be used within GamifiedTaskProvider');
  }
  return context;
};

interface GamifiedTaskProviderProps {
  children: ReactNode;
}

export const GamifiedTaskProvider: React.FC<GamifiedTaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { userStatus, updateHP, updateMP, addXP, addIntExp, addSpeedExp } = useUserStatus();

  // タスクの読み込み
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedTasks = JSON.parse(stored, (key, value) => {
            if (key === 'createdAt' || key === 'dueDate' || key === 'completedAt') {
              return value ? new Date(value) : null;
            }
            return value;
          });
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };
    loadTasks();
  }, []);

  // タスクの保存
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };
    if (tasks.length > 0 || tasks.length === 0) {
      saveTasks();
    }
  }, [tasks]);

  const addTask = (taskData: Partial<Task>) => {
    // HPチェック：0以下なら新規タスク追加不可
    if (userStatus.currentHP <= 0) {
      alert('HPが不足しています。回復タスクを完了してください。');
      return;
    }

    // サイズに基づいた自動判定：Largeサイズは自動的にプロジェクトとして扱う
    const taskSize = taskData.size || 'Medium';
    let taskType = taskData.type;

    if (!taskType) {
      // typeが指定されていない場合、サイズで自動判定
      taskType = taskSize === 'Large' ? 'PROJECT' : 'TASK';
    }

    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: taskData.title || '新しいタスク',
      detail: taskData.detail,
      type: taskType,
      size: taskSize,
      isCompleted: false,
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || 1,
      parentID: taskData.parentID || null,
      childrenIDs: taskData.childrenIDs || [],
      stakedPoints: 0,
      createdAt: new Date(),
      tags: taskData.tags || [],
    };

    // 未確定報酬をストック
    newTask.stakedPoints = calculateStakedPoints(newTask);

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates };

          // サイズがLargeに変更され、かつ明示的にTASKタイプで子タスクがない場合はプロジェクトに自動昇格
          if (updates.size === 'Large' &&
            updatedTask.type === 'TASK' &&
            updatedTask.childrenIDs.length === 0) {
            updatedTask.type = 'PROJECT';
            console.log(`タスク "${updatedTask.title}" をプロジェクトに自動昇格しました（サイズ: Large）`);
          }

          // 更新時にストックポイントを再計算
          updatedTask.stakedPoints = calculateStakedPoints(updatedTask);
          return updatedTask;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;

      // 完了タスクを未完了に戻す場合
      if (task.isCompleted) {
        return prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              isCompleted: false,
              completedAt: undefined,
            };
          }
          return t;
        });
      }

      // 未完了タスクを完了にする場合（既存のcompleteTask処理）
      // プロジェクトの場合、全サブタスクが完了しているかチェック
      if (task.type === 'PROJECT') {
        const allSubtasksCompleted = task.childrenIDs.every((childId) => {
          const child = prev.find((t) => t.id === childId);
          return child?.isCompleted;
        });

        if (!allSubtasksCompleted) {
          alert('全てのサブタスクを完了してください。');
          return prev;
        }
      }

      // 完了処理
      return prev.map((t) => {
        if (t.id === id) {
          const completedTask = {
            ...t,
            isCompleted: true,
            completedAt: new Date(),
          };

          // 報酬の確定
          const reward = calculateConfirmedReward(completedTask, userStatus);
          addXP(reward);

          // HP/MP回復チェック
          const hpRecovery = calculateHPRecovery(completedTask);
          const mpRecovery = calculateMPRecovery(completedTask);
          if (hpRecovery > 0) updateHP(hpRecovery);
          if (mpRecovery > 0) updateMP(mpRecovery);

          // プロジェクト完了時の追加ボーナス
          if (completedTask.type === 'PROJECT') {
            // 子タスクの報酬を合算
            const childTasks = prev.filter((child) =>
              completedTask.childrenIDs.includes(child.id)
            );
            const totalChildReward = childTasks.reduce(
              (sum, child) => sum + child.stakedPoints,
              0
            );

            // プロジェクト完了ボーナス（子タスク報酬の20%）
            const projectBonus = Math.floor(totalChildReward * 0.2);
            addXP(projectBonus);

            // INT経験値（プロジェクト完了）
            addIntExp(30);

            // 短期決戦ボーナスチェック
            if (completedTask.createdAt) {
              const projectDuration =
                (completedTask.completedAt!.getTime() - completedTask.createdAt.getTime()) /
                (1000 * 60 * 60 * 24); // 日数

              const expectedDuration = completedTask.size === 'Large' ? 7 :
                completedTask.size === 'Medium' ? 3 : 1;

              if (projectDuration <= expectedDuration) {
                // 短期決戦ボーナス
                const speedBonus = Math.floor(totalChildReward * 0.3);
                addXP(speedBonus);
                addSpeedExp(40);
                console.log(`🎉 短期決戦ボーナス: ${speedBonus}XP + 40 Speed経験値!`);
              }
            }

            console.log(`🎊 プロジェクト完了ボーナス: ${projectBonus}XP + 30 INT経験値!`);
          }

          // INT/Speed経験値（通常タスク）
          if (shouldGainINTExperience(completedTask)) {
            const intExpGain = completedTask.type === 'PROJECT' ? 30 : 15;
            addIntExp(intExpGain);
          }
          if (shouldGainSpeedExperience(completedTask)) {
            const speedExpGain = 20;
            addSpeedExp(speedExpGain);
          }

          return completedTask;
        }
        return t;
      });
    });
  };

  const completeTask = (id: string) => {
    toggleTask(id);
  };

  const promoteToProject = (id: string) => {
    setTasks((prev) => {
      const taskToPromote = prev.find((t) => t.id === id);
      if (!taskToPromote) {
        console.error(`❌ タスクが見つかりません: ${id}`);
        return prev;
      }

      console.log(`📁 プロジェクト昇格開始: "${taskToPromote.title}"`);
      console.log(`   現在のタイプ: ${taskToPromote.type}`);

      const updatedTasks = prev.map((task) => {
        if (task.id === id) {
          const promoted = {
            ...task,
            type: 'PROJECT' as const,
          };
          console.log(`   新しいタイプ: ${promoted.type}`);
          return promoted;
        }
        return task;
      });

      // 昇格後のタスクを確認
      const afterPromotion = updatedTasks.find((t) => t.id === id);
      console.log(`✅ プロジェクト昇格完了: type = ${afterPromotion?.type}`);

      // プロジェクトタイプのタスク数を表示
      const projectCount = updatedTasks.filter((t) => t.type === 'PROJECT' && !t.parentID).length;
      console.log(`📊 現在のプロジェクト数: ${projectCount}`);

      return updatedTasks;
    });
  };

  const demoteToTask = (id: string) => {
    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === id);
      if (!targetTask) return prev;

      // 子タスクの親IDをクリアして独立したタスクに変更
      return prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            type: 'TASK' as const,
            childrenIDs: [],
          };
        }
        if (targetTask.childrenIDs.includes(task.id)) {
          return { ...task, parentID: null, type: 'TASK' as const };
        }
        return task;
      });
    });
  };

  const addSubtask = (parentId: string, subtaskData: Partial<Task>) => {
    const parent = tasks.find((t) => t.id === parentId);
    if (!parent) {
      alert('親タスクが見つかりません。');
      return;
    }

    // 親タスクがプロジェクトでない場合、自動的にプロジェクトに昇格
    if (parent.type !== 'PROJECT') {
      console.log(`タスク "${parent.title}" をプロジェクトに昇格します`);
    }

    const newSubtask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: subtaskData.title || '新しいサブタスク',
      detail: subtaskData.detail,
      type: 'SUBTASK',
      size: subtaskData.size || 'Small',
      isCompleted: false,
      dueDate: subtaskData.dueDate || null,
      priority: subtaskData.priority || 1,
      parentID: parentId,
      childrenIDs: [],
      stakedPoints: 0,
      createdAt: new Date(),
      tags: subtaskData.tags || [],
    };

    newSubtask.stakedPoints = calculateStakedPoints(newSubtask);

    setTasks((prev) => {
      // 親タスクの childrenIDs を更新
      const updatedTasks = prev.map((task) => {
        if (task.id === parentId) {
          const newChildrenIDs = [...task.childrenIDs, newSubtask.id];

          // 分解ボーナスチェック
          const bonus = calculateDecompositionBonus(task.size, newChildrenIDs.length);
          if (bonus > 0) {
            addXP(bonus);
            addIntExp(25); // INT経験値も追加
          }

          return {
            ...task,
            type: 'PROJECT' as const, // サブタスクが追加された時点でプロジェクトに昇格
            childrenIDs: newChildrenIDs,
          };
        }
        return task;
      });

      return [newSubtask, ...updatedTasks];
    });
  };

  const getTasksByType = (type: 'TASK' | 'PROJECT' | 'SUBTASK') => {
    return tasks.filter((task) => task.type === type);
  };

  const getActiveTasks = () => {
    return tasks.filter((task) => !task.isCompleted);
  };

  const getCompletedTasks = () => {
    return tasks.filter((task) => task.isCompleted);
  };

  return (
    <GamifiedTaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        toggleTask,
        promoteToProject,
        demoteToTask,
        addSubtask,
        getTasksByType,
        getActiveTasks,
        getCompletedTasks,
      }}
    >
      {children}
    </GamifiedTaskContext.Provider>
  );
};
