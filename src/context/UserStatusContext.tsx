import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUserStatus } from '../types/Task';

interface UserStatusContextType {
  userStatus: IUserStatus;
  updateHP: (delta: number) => void;
  updateMP: (delta: number) => void;
  addXP: (amount: number) => void;
  addIntExp: (amount: number) => void;
  addSpeedExp: (amount: number) => void;
  levelUpINT: () => void;
  levelUpSpeed: () => void;
  resetStatus: () => void;
  getNextLevelXP: () => number;
  getIntExpProgress: () => { current: number; needed: number };
  getSpeedExpProgress: () => { current: number; needed: number };
}

const STORAGE_KEY = '@gamified_todo:user_status';

const defaultUserStatus: IUserStatus = {
  currentHP: 100,
  maxHP: 100,
  currentMP: 100,
  maxMP: 100,
  xpTotal: 0,
  level: 1,
  levelINT: 1,
  levelSpeed: 1,
  intExp: 0,
  speedExp: 0,
};

// レベル計算関数（100XPごとにレベルアップ）
const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

// 次のレベルまでの必要XP
const calculateNextLevelXP = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  return currentLevel * 100;
};

// INT/Speedレベルアップに必要な経験値（レベルに応じて増加）
const calculateExpForLevel = (level: number): number => {
  return level * 50; // レベル1→2: 50exp, レベル2→3: 100exp...
};

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within UserStatusProvider');
  }
  return context;
};

interface UserStatusProviderProps {
  children: ReactNode;
}

export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ children }) => {
  const [userStatus, setUserStatus] = useState<IUserStatus>(defaultUserStatus);

  // ステータスの読み込み
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUserStatus(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load user status:', error);
      }
    };
    loadStatus();
  }, []);

  // ステータスの保存
  useEffect(() => {
    const saveStatus = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userStatus));
      } catch (error) {
        console.error('Failed to save user status:', error);
      }
    };
    saveStatus();
  }, [userStatus]);

  const updateHP = (delta: number) => {
    setUserStatus((prev) => ({
      ...prev,
      currentHP: Math.max(0, Math.min(prev.maxHP, prev.currentHP + delta)),
    }));
  };

  const updateMP = (delta: number) => {
    setUserStatus((prev) => ({
      ...prev,
      currentMP: Math.max(0, Math.min(prev.maxMP, prev.currentMP + delta)),
    }));
  };

  const addXP = (amount: number) => {
    setUserStatus((prev) => {
      const newXpTotal = prev.xpTotal + amount;
      const newLevel = calculateLevel(newXpTotal);
      
      // レベルアップ時の処理
      if (newLevel > prev.level) {
        const hpIncrease = 10;
        const mpIncrease = 10;
        
        return {
          ...prev,
          xpTotal: newXpTotal,
          level: newLevel,
          maxHP: prev.maxHP + hpIncrease,
          maxMP: prev.maxMP + mpIncrease,
          currentHP: Math.min(prev.currentHP + hpIncrease, prev.maxHP + hpIncrease),
          currentMP: Math.min(prev.currentMP + mpIncrease, prev.maxMP + mpIncrease),
        };
      }
      
      return {
        ...prev,
        xpTotal: newXpTotal,
        level: newLevel,
      };
    });
  };

  const addIntExp = (amount: number) => {
    setUserStatus((prev) => {
      const newIntExp = prev.intExp + amount;
      const expNeeded = calculateExpForLevel(prev.levelINT);
      
      if (newIntExp >= expNeeded) {
        // INTレベルアップ
        return {
          ...prev,
          intExp: newIntExp - expNeeded,
          levelINT: prev.levelINT + 1,
        };
      }
      
      return {
        ...prev,
        intExp: newIntExp,
      };
    });
  };

  const addSpeedExp = (amount: number) => {
    setUserStatus((prev) => {
      const newSpeedExp = prev.speedExp + amount;
      const expNeeded = calculateExpForLevel(prev.levelSpeed);
      
      if (newSpeedExp >= expNeeded) {
        // Speedレベルアップ
        return {
          ...prev,
          speedExp: newSpeedExp - expNeeded,
          levelSpeed: prev.levelSpeed + 1,
        };
      }
      
      return {
        ...prev,
        speedExp: newSpeedExp,
      };
    });
  };

  const levelUpINT = () => {
    setUserStatus((prev) => ({
      ...prev,
      levelINT: prev.levelINT + 1,
      intExp: 0,
    }));
  };

  const levelUpSpeed = () => {
    setUserStatus((prev) => ({
      ...prev,
      levelSpeed: prev.levelSpeed + 1,
      speedExp: 0,
    }));
  };

  const resetStatus = () => {
    setUserStatus(defaultUserStatus);
  };

  const getNextLevelXP = () => {
    return calculateNextLevelXP(userStatus.xpTotal);
  };

  const getIntExpProgress = () => {
    return {
      current: userStatus.intExp,
      needed: calculateExpForLevel(userStatus.levelINT),
    };
  };

  const getSpeedExpProgress = () => {
    return {
      current: userStatus.speedExp,
      needed: calculateExpForLevel(userStatus.levelSpeed),
    };
  };

  return (
    <UserStatusContext.Provider
      value={{
        userStatus,
        updateHP,
        updateMP,
        addXP,
        addIntExp,
        addSpeedExp,
        levelUpINT,
        levelUpSpeed,
        resetStatus,
        getNextLevelXP,
        getIntExpProgress,
        getSpeedExpProgress,
      }}
    >
      {children}
    </UserStatusContext.Provider>
  );
};
