import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useUserStatus } from '../context/UserStatusContext';

const PomodoroTimer: React.FC = () => {
  const { updateMP } = useUserStatus();
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // タイマー終了
                handleTimerComplete();
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (!isBreak) {
      // ポモドーロ完了
      setCompletedPomodoros((prev) => prev + 1);
      updateMP(10); // MP回復
      Alert.alert(
        '🎉 ポモドーロ完了！',
        'お疲れ様です！MP +10 を獲得しました。',
        [
          {
            text: '休憩する（5分）',
            onPress: () => startBreak(5),
          },
          {
            text: '長めの休憩（15分）',
            onPress: () => startBreak(15),
          },
          {
            text: '続ける',
            onPress: () => reset(),
          },
        ]
      );
    } else {
      // 休憩終了
      Alert.alert('休憩終了', '次のポモドーロを始めましょう！', [
        { text: 'OK', onPress: () => reset() },
      ]);
    }
  };

  const start = () => {
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const stop = () => {
    if (isRunning && !isBreak) {
      // ポモドーロ中断によるMPペナルティ
      Alert.alert(
        '⚠️ 中断の確認',
        'ポモドーロを中断すると、MP -5 のペナルティがあります。',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '中断する',
            onPress: () => {
              updateMP(-5);
              reset();
            },
            style: 'destructive',
          },
        ]
      );
    } else {
      reset();
    }
  };

  const reset = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  const startBreak = (breakMinutes: number) => {
    setIsBreak(true);
    setMinutes(breakMinutes);
    setSeconds(0);
    setIsRunning(true);
  };

  const formatTime = (min: number, sec: number) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ポモドーロタイマー</Text>
        <Text style={styles.subtitle}>
          {isBreak ? '🌿 休憩中' : '🍅 集中タイム'}
        </Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timer, isBreak && styles.timerBreak]}>
          {formatTime(minutes, seconds)}
        </Text>
        <Text style={styles.completedCount}>
          完了: {completedPomodoros} 🍅
        </Text>
      </View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={start}>
            <Text style={styles.startButtonText}>開始</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={pause}>
            <Text style={styles.pauseButtonText}>一時停止</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.stopButton} onPress={stop}>
          <Text style={styles.stopButtonText}>リセット</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 ポモドーロテクニック</Text>
        <Text style={styles.infoText}>
          • 25分間集中して作業{'\n'}
          • 完了後にMP +10 を獲得{'\n'}
          • 中断するとMP -5 のペナルティ{'\n'}
          • 休憩を挟んで効率的に作業
        </Text>
      </View>

      {isBreak && (
        <View style={styles.breakBanner}>
          <Text style={styles.breakText}>🌿 リラックスタイム</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
  },
  timerBreak: {
    color: '#10b981',
  },
  completedCount: {
    fontSize: 18,
    color: '#6b7280',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    flex: 1,
    maxWidth: 200,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    flex: 1,
    maxWidth: 200,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 22,
  },
  breakBanner: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  breakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
  },
});

export default PomodoroTimer;
