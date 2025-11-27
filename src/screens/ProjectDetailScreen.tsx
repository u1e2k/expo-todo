import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGamifiedTasks } from '../context/GamifiedTaskContext';
import { ITask } from '../types/Task';

type RootStackParamList = {
  GamifiedHome: undefined;
  ProjectDetail: { projectId: string };
  GamifiedTaskForm: { task?: ITask; parentId?: string };
};

type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

const ProjectDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailRouteProp>();
  const { tasks, toggleTask, deleteTask, demoteToTask } = useGamifiedTasks();

  const projectId = route.params.projectId;
  const project = tasks.find((t) => t.id === projectId);

  if (!project || project.type !== 'PROJECT') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>プロジェクトが見つかりません</Text>
      </View>
    );
  }

  const subtasks = tasks.filter((t) => project.childrenIDs.includes(t.id));
  const completedCount = subtasks.filter((t) => t.isCompleted).length;
  const totalStakedPoints = project.stakedPoints + subtasks.reduce((sum, t) => sum + t.stakedPoints, 0);
  const completedStakedPoints = project.stakedPoints + 
    subtasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.stakedPoints, 0);

  // プロジェクト完了ボーナスの計算
  const childTasksReward = subtasks.reduce((sum, t) => sum + t.stakedPoints, 0);
  const projectCompletionBonus = Math.floor(childTasksReward * 0.2);

  // 短期決戦ボーナスの判定
  const getSpeedBonusStatus = () => {
    if (!project.createdAt) return null;
    
    const now = new Date();
    const daysSinceCreation = 
      (now.getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    const expectedDuration = project.size === 'Large' ? 7 : 
                            project.size === 'Medium' ? 3 : 1;
    
    const remainingDays = expectedDuration - daysSinceCreation;
    
    if (daysSinceCreation <= expectedDuration) {
      return {
        eligible: true,
        remainingDays: Math.ceil(remainingDays),
        bonus: Math.floor(childTasksReward * 0.3),
      };
    }
    
    return { eligible: false, remainingDays: 0, bonus: 0 };
  };

  const speedBonusStatus = getSpeedBonusStatus();

  const handleAddSubtask = () => {
    navigation.navigate('GamifiedTaskForm', { parentId: projectId });
  };

  const handleDemote = () => {
    Alert.alert(
      'プロジェクトを降格',
      'このプロジェクトを通常のタスクに降格しますか？サブタスクは独立したタスクになります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '降格',
          style: 'destructive',
          onPress: () => {
            demoteToTask(projectId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteSubtask = (id: string) => {
    Alert.alert('削除の確認', 'このサブタスクを削除しますか?', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => deleteTask(id),
      },
    ]);
  };

  const renderSubtask = ({ item }: { item: ITask }) => {
    return (
      <TouchableOpacity
        style={[
          styles.subtaskItem,
          item.isCompleted && styles.subtaskCompleted,
        ]}
        onLongPress={() => handleDeleteSubtask(item.id)}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item.id)}
        >
          {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.subtaskContent}>
          <Text
            style={[
              styles.subtaskTitle,
              item.isCompleted && styles.subtaskTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
          {item.detail && (
            <Text style={styles.subtaskDetail} numberOfLines={1}>
              {item.detail}
            </Text>
          )}
          <View style={styles.subtaskMeta}>
            <Text style={styles.pointsText}>💰 {item.stakedPoints}pt</Text>
            {item.priority === 3 && <Text>🔥</Text>}
            {item.priority === 2 && <Text>⚡</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* プロジェクトヘッダー */}
      <View style={styles.header}>
        <Text style={styles.projectTitle}>📁 {project.title}</Text>
        {project.detail && (
          <Text style={styles.projectDetail}>{project.detail}</Text>
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              進捗: {completedCount} / {subtasks.length} ({Math.round((completedCount / Math.max(subtasks.length, 1)) * 100)}%)
            </Text>
            <Text style={styles.progressPoints}>
              💰 {completedStakedPoints} / {totalStakedPoints}pt
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(completedCount / Math.max(subtasks.length, 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* 報酬情報 */}
        <View style={styles.rewardSection}>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>基本報酬:</Text>
            <Text style={styles.rewardValue}>💰 {totalStakedPoints}pt</Text>
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardLabel}>完了ボーナス:</Text>
            <Text style={styles.rewardValue}>+{projectCompletionBonus}pt (20%)</Text>
          </View>
          {speedBonusStatus?.eligible && (
            <View style={[styles.rewardRow, styles.speedBonusRow]}>
              <Text style={styles.speedBonusLabel}>
                ⚡ 短期決戦ボーナス: 残り{speedBonusStatus.remainingDays}日
              </Text>
              <Text style={styles.speedBonusValue}>
                +{speedBonusStatus.bonus}pt (30%)
              </Text>
            </View>
          )}
          <View style={[styles.rewardRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>総獲得予定:</Text>
            <Text style={styles.totalValue}>
              💰 {totalStakedPoints + projectCompletionBonus + (speedBonusStatus?.eligible ? speedBonusStatus.bonus : 0)}pt
            </Text>
          </View>
        </View>

        {/* INT経験値情報 */}
        <View style={styles.expInfo}>
          <Text style={styles.expText}>
            🧠 完了時にINT経験値 +30
          </Text>
        </View>
      </View>

      {/* サブタスクリスト */}
      <FlatList
        data={subtasks}
        renderItem={renderSubtask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>サブタスクがありません</Text>
            <Text style={styles.emptyHint}>
              下のボタンからサブタスクを追加してください
            </Text>
          </View>
        }
      />

      {/* アクションボタン */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.demoteButton}
          onPress={handleDemote}
        >
          <Text style={styles.demoteButtonText}>⬇️ タスクに降格</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSubtask}
        >
          <Text style={styles.addButtonText}>+ サブタスク追加</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  projectDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  rewardSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardLabel: {
    fontSize: 13,
    color: '#78350f',
  },
  rewardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  speedBonusRow: {
    backgroundColor: '#dbeafe',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  speedBonusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    flex: 1,
  },
  speedBonusValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
    marginTop: 6,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#78350f',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  expInfo: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  expText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  listContent: {
    padding: 16,
  },
  subtaskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subtaskCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#10b981',
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  subtaskDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  subtaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#d1d5db',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  demoteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProjectDetailScreen;
