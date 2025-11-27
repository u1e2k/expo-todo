import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUserStatus } from '../context/UserStatusContext';

const StatusScreen: React.FC = () => {
  const { userStatus, resetStatus, getNextLevelXP, getIntExpProgress, getSpeedExpProgress } = useUserStatus();

  const calculateHPPercentage = () => {
    return (userStatus.currentHP / userStatus.maxHP) * 100;
  };

  const calculateMPPercentage = () => {
    return (userStatus.currentMP / userStatus.maxMP) * 100;
  };

  const getHPColor = () => {
    const percentage = calculateHPPercentage();
    if (percentage > 60) return '#4ade80';
    if (percentage > 30) return '#fbbf24';
    return '#ef4444';
  };

  const getMPColor = () => {
    const percentage = calculateMPPercentage();
    if (percentage > 60) return '#60a5fa';
    if (percentage > 30) return '#a78bfa';
    return '#ec4899';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ステータス</Text>
        <Text style={styles.subtitle}>あなたのRPGステータス</Text>
      </View>

      {/* HP表示 */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>体力 (HP)</Text>
          <Text style={styles.statusValue}>
            {userStatus.currentHP} / {userStatus.maxHP}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${calculateHPPercentage()}%`,
                backgroundColor: getHPColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.statusDescription}>
          実行力。0になると新規タスクの登録がブロックされます。
        </Text>
      </View>

      {/* MP表示 */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>精神力 (MP)</Text>
          <Text style={styles.statusValue}>
            {userStatus.currentMP} / {userStatus.maxMP}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${calculateMPPercentage()}%`,
                backgroundColor: getMPColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.statusDescription}>
          集中力・意欲。報酬の確定率に影響します。
        </Text>
      </View>

      {/* Level & XP表示 */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>レベル</Text>
          <Text style={styles.statusValue}>Lv.{userStatus.level}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${((userStatus.xpTotal % 100) / 100) * 100}%`,
                backgroundColor: '#a78bfa',
              },
            ]}
          />
        </View>
        <View style={styles.expInfo}>
          <Text style={styles.expText}>
            {userStatus.xpTotal % 100} / 100 XP
          </Text>
          <Text style={styles.expText}>
            総XP: {userStatus.xpTotal.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          100XPごとにレベルアップ。HP/MP最大値が+10増加。
        </Text>
      </View>

      {/* INT表示 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>知力 (INT)</Text>
          <Text style={styles.statValue}>Lv.{userStatus.levelINT}</Text>
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${(getIntExpProgress().current / getIntExpProgress().needed) * 100}%`,
                  backgroundColor: '#fbbf24',
                },
              ]}
            />
          </View>
          <Text style={styles.expSmallText}>
            {getIntExpProgress().current} / {getIntExpProgress().needed}
          </Text>
          <Text style={styles.statDescription}>計画の質と複雑さ</Text>
        </View>

        {/* Speed表示 */}
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>スピード</Text>
          <Text style={styles.statValue}>Lv.{userStatus.levelSpeed}</Text>
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${(getSpeedExpProgress().current / getSpeedExpProgress().needed) * 100}%`,
                  backgroundColor: '#10b981',
                },
              ]}
            />
          </View>
          <Text style={styles.expSmallText}>
            {getSpeedExpProgress().current} / {getSpeedExpProgress().needed}
          </Text>
          <Text style={styles.statDescription}>タスク実行効率</Text>
        </View>
      </View>

      {/* リセットボタン */}
      <TouchableOpacity style={styles.resetButton} onPress={resetStatus}>
        <Text style={styles.resetButtonText}>ステータスをリセット</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 ステータスの上げ方</Text>
        <Text style={styles.infoText}>
          • レベル：タスク完了でXP獲得、100XPごとにレベルアップ{'\n'}
          • HP：回復タスク（運動、休息、睡眠）を完了{'\n'}
          • MP：メンタルケアタスクを完了、ポモドーロを中断なく完了{'\n'}
          • INT：プロジェクト分解（25exp）、学習タスク完了（15exp）{'\n'}
          • Speed：タスクを素早く完了（24時間以内で20exp）
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  statusDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  expInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  expText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  expSmallText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});

export default StatusScreen;
