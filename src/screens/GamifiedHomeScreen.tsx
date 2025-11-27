import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGamifiedTasks } from '../context/GamifiedTaskContext';
import { useUserStatus } from '../context/UserStatusContext';
import { ITask } from '../types/Task';

type RootStackParamList = {
  GamifiedHome: undefined;
  GamifiedTaskForm: { task?: ITask; parentId?: string };
  Status: undefined;
  Pomodoro: undefined;
  ProjectDetail: { projectId: string };
};

const GamifiedHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    tasks,
    toggleTask,
    deleteTask,
    promoteToProject,
    demoteToTask,
  } = useGamifiedTasks();
  const { userStatus } = useUserStatus();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'project'>('active');

  const filteredTasks = tasks.filter((task) => {
    // 親なしのタスクのみ表示（サブタスクは親タスクの中で表示）
    if (task.parentID) return false;

    if (filter === 'project') {
      const isProject = task.type === 'PROJECT';
      if (isProject) {
        console.log(`🔍 プロジェクトフィルタ: "${task.title}" (type: ${task.type}) - 表示`);
      }
      return isProject;
    }
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  // フィルタ変更時にログ出力
  React.useEffect(() => {
    console.log(`🔄 フィルタ変更: ${filter}`);
    console.log(`📋 全タスク数: ${tasks.length}`);
    console.log(`📊 プロジェクト数: ${tasks.filter(t => t.type === 'PROJECT' && !t.parentID).length}`);
    console.log(`✅ フィルタ後のタスク数: ${filteredTasks.length}`);
  }, [filter, tasks]);

  const handleAddTask = () => {
    if (userStatus.currentHP <= 0) {
      window.alert('⚠️ HP不足\n\nHPが0です。回復タスクを完了してからタスクを追加してください。');
      return;
    }
    navigation.navigate('GamifiedTaskForm', {});
  };

  const handleDeleteTask = (id: string) => {
    const confirmed = window.confirm('このタスクを削除しますか?');
    if (confirmed) {
      deleteTask(id);
    }
  };

  const handleEditTask = (task: ITask) => {
    navigation.navigate('GamifiedTaskForm', { task });
  };

  const handlePromoteToProject = (id: string) => {
    const task = tasks.find(t => t.id === id);

    // Web環境でも動作するようにwindow.confirmを使用
    const confirmed = window.confirm(
      `「${task?.title}」をプロジェクトに昇格しますか？\n昇格後、サブタスクを追加できます。`
    );

    if (confirmed) {
      console.log(`昇格ボタン押下: ${task?.title}`);
      promoteToProject(id);
      // プロジェクトフィルターに切り替えて昇格したプロジェクトを表示
      setTimeout(() => {
        setFilter('project');
        console.log('フィルターをprojectに切り替えました');
      }, 100);
    }
  };

  const renderTaskItem = ({ item }: { item: ITask }) => {
    const getSizeColor = () => {
      if (item.size === 'Large') return '#ef4444';
      if (item.size === 'Medium') return '#f59e0b';
      return '#10b981';
    };

    const getPriorityLabel = () => {
      if (item.priority === 3) return '🔥';
      if (item.priority === 2) return '⚡';
      return '💤';
    };

    // プロジェクトの場合、サブタスク情報を取得
    const getProjectStats = () => {
      if (item.type !== 'PROJECT') return null;

      const subtasks = tasks.filter((t) => item.childrenIDs.includes(t.id));
      const completedCount = subtasks.filter((t) => t.isCompleted).length;
      const totalCount = subtasks.length;
      const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return { completedCount, totalCount, progress };
    };

    const projectStats = getProjectStats();

    return (
      <View
        style={[
          styles.taskItem,
          item.isCompleted && styles.taskItemCompleted,
        ]}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item.id)}
        >
          {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => handleEditTask(item)}
          onLongPress={() => handleDeleteTask(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                item.isCompleted && styles.taskTitleCompleted,
              ]}
            >
              {item.title}
            </Text>
            <View style={styles.badges}>
              <Text style={styles.priorityBadge}>{getPriorityLabel()}</Text>
              {item.type === 'PROJECT' && (
                <Text style={styles.projectBadge}>📁</Text>
              )}
            </View>
          </View>

          {item.detail && (
            <Text style={styles.taskDetail} numberOfLines={1}>
              {item.detail}
            </Text>
          )}

          <View style={styles.taskMeta}>
            <View
              style={[styles.sizeBadge, { backgroundColor: getSizeColor() }]}
            >
              <Text style={styles.sizeBadgeText}>{item.size}</Text>
            </View>

            <Text style={styles.pointsText}>💰 {item.stakedPoints}pt</Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tags}>
                {item.tags.map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    {tag === 'recovery'
                      ? '🏃'
                      : tag === 'mental-care'
                        ? '🧘'
                        : '📚'}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {item.type === 'PROJECT' && projectStats && (
            <View style={styles.projectProgressSection}>
              <View style={styles.projectProgressHeader}>
                <Text style={styles.projectProgressText}>
                  進捗: {projectStats.completedCount}/{projectStats.totalCount}
                </Text>
                <Text style={styles.projectProgressPercent}>
                  {Math.round(projectStats.progress)}%
                </Text>
              </View>
              <View style={styles.projectProgressBar}>
                <View
                  style={[
                    styles.projectProgressFill,
                    { width: `${projectStats.progress}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.projectDetailButton}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
              >
                <Text style={styles.projectDetailButtonText}>
                  詳細を見る →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {item.type !== 'PROJECT' && !item.isCompleted && (
            <TouchableOpacity
              style={styles.promoteButton}
              onPress={() => handlePromoteToProject(item.id)}
            >
              <Text style={styles.promoteButtonText}>
                📁 プロジェクトに昇格
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ステータスバー */}
      <TouchableOpacity
        style={styles.statusBar}
        onPress={() => navigation.navigate('Status')}
      >
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>HP</Text>
          <View style={styles.statusBarFill}>
            <View
              style={[
                styles.statusBarProgress,
                {
                  width: `${(userStatus.currentHP / userStatus.maxHP) * 100}%`,
                  backgroundColor: '#4ade80',
                },
              ]}
            />
          </View>
          <Text style={styles.statusValue}>
            {userStatus.currentHP}/{userStatus.maxHP}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>MP</Text>
          <View style={styles.statusBarFill}>
            <View
              style={[
                styles.statusBarProgress,
                {
                  width: `${(userStatus.currentMP / userStatus.maxMP) * 100}%`,
                  backgroundColor: '#60a5fa',
                },
              ]}
            />
          </View>
          <Text style={styles.statusValue}>
            {userStatus.currentMP}/{userStatus.maxMP}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Lv.{userStatus.level}</Text>
          <View style={styles.statusBarFill}>
            <View
              style={[
                styles.statusBarProgress,
                {
                  width: `${((userStatus.xpTotal % 100) / 100) * 100}%`,
                  backgroundColor: '#a78bfa',
                },
              ]}
            />
          </View>
          <Text style={styles.statusValue}>
            {userStatus.xpTotal % 100}/100
          </Text>
        </View>
      </TouchableOpacity>

      {/* フィルターボタン */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed', 'project'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f === 'all' ? '全て' : f === 'active' ? '未完了' : f === 'completed' ? '完了' : 'プロジェクト'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* タスクリスト */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>タスクがありません</Text>
          </View>
        }
      />

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.pomodoroButton}
          onPress={() => navigation.navigate('Pomodoro')}
        >
          <Text style={styles.pomodoroButtonText}>🍅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+</Text>
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
  statusBar: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  statusBarFill: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statusBarProgress: {
    height: '100%',
  },
  statusValue: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
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
  taskItemCompleted: {
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
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityBadge: {
    fontSize: 16,
  },
  projectBadge: {
    fontSize: 16,
  },
  taskDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    fontSize: 14,
  },
  promoteButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  projectProgressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  projectProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  projectProgressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  projectProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  projectProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  projectDetailButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  projectDetailButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  projectInfo: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  projectInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  pomodoroButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pomodoroButtonText: {
    fontSize: 28,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GamifiedHomeScreen;
