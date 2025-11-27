import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Task, FilterType } from '../types/Task';
import { loadTasks, saveTasks } from '../utils/storage';

interface TaskContextType {
  tasks: Task[];
  filter: FilterType;
  addTask: (title: string, detail: string) => void;
  updateTask: (id: string, title: string, detail: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  getFilteredTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const initializeTasks = async () => {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    };
    initializeTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || tasks.length === 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const addTask = (title: string, detail: string) => {
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      detail,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, title: string, detail: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, title, detail } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter((task) => !task.isCompleted);
      case 'completed':
        return tasks.filter((task) => task.isCompleted);
      default:
        return tasks;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filter,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        setFilter,
        getFilteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
