import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useGamifiedTasks } from '../context/GamifiedTaskContext';
import { ITask } from '../types/Task';

type RootStackParamList = {
  Home: undefined;
  GamifiedTaskForm: { task?: ITask; parentId?: string };
};

type GamifiedTaskFormScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GamifiedTaskForm'
>;

type GamifiedTaskFormScreenRouteProp = RouteProp<RootStackParamList, 'GamifiedTaskForm'>;

interface GamifiedTaskFormScreenProps {
  navigation: GamifiedTaskFormScreenNavigationProp;
  route: GamifiedTaskFormScreenRouteProp;
}

export const GamifiedTaskFormScreen: React.FC<GamifiedTaskFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { addTask, updateTask, addSubtask } = useGamifiedTasks();
  const { task, parentId } = route.params || {};

  const [title, setTitle] = useState(task?.title || '');
  const [detail, setDetail] = useState(task?.detail || '');
  const [size, setSize] = useState<'Small' | 'Medium' | 'Large'>(task?.size || 'Medium');
  const [priority, setPriority] = useState<number>(task?.priority || 1);
  const [dueDate, setDueDate] = useState<string>('');
  const [isRecoveryTask, setIsRecoveryTask] = useState(
    task?.tags?.includes('recovery') || false
  );
  const [isMentalCareTask, setIsMentalCareTask] = useState(
    task?.tags?.includes('mental-care') || false
  );
  const [isLearningTask, setIsLearningTask] = useState(
    task?.tags?.includes('learning') || false
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: task ? 'タスク編集' : parentId ? 'サブタスク追加' : 'タスク追加',
    });
  }, [navigation, task, parentId]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('タスク名を入力してください');
      return;
    }

    const tags: string[] = [];
    if (isRecoveryTask) tags.push('recovery');
    if (isMentalCareTask) tags.push('mental-care');
    if (isLearningTask) tags.push('learning');

    const taskData: Partial<ITask> = {
      title: title.trim(),
      detail: detail.trim(),
      size,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else if (parentId) {
      // サブタスクとして追加
      addSubtask(parentId, taskData);
    } else {
      addTask(taskData);
    }

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>タスク名 *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="タスク名を入力"
            autoFocus
          />

          <Text style={styles.label}>詳細</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={detail}
            onChangeText={setDetail}
            placeholder="詳細を入力（任意）"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* サイズ選択 */}
          <Text style={styles.label}>タスクサイズ</Text>
          <View style={styles.sizeContainer}>
            {(['Small', 'Medium', 'Large'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.sizeButton,
                  size === s && styles.sizeButtonActive,
                ]}
                onPress={() => setSize(s)}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    size === s && styles.sizeButtonTextActive,
                  ]}
                >
                  {s === 'Small' ? 'S' : s === 'Medium' ? 'M' : 'L'}
                </Text>
                <Text style={styles.sizeLabel}>
                  {s === 'Small' ? '10pt' : s === 'Medium' ? '25pt' : '50pt'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 優先度選択 */}
          <Text style={styles.label}>優先度</Text>
          <View style={styles.priorityContainer}>
            {[1, 2, 3].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive,
                  ]}
                >
                  {p === 1 ? '低' : p === 2 ? '中' : '高'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 期限設定 */}
          <Text style={styles.label}>期限（YYYY-MM-DD）</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2025-12-31"
          />

          {/* タグ設定 */}
          <Text style={styles.label}>タスクタグ</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🏃 回復タスク（HP回復）</Text>
            <Switch
              value={isRecoveryTask}
              onValueChange={setIsRecoveryTask}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🧘 メンタルケア（MP回復）</Text>
            <Switch
              value={isMentalCareTask}
              onValueChange={setIsMentalCareTask}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>📚 学習タスク（INT経験値）</Text>
            <Switch
              value={isLearningTask}
              onValueChange={setIsLearningTask}
            />
          </View>

          {/* 報酬プレビュー */}
          <View style={styles.rewardPreview}>
            <Text style={styles.rewardTitle}>💰 未確定報酬プレビュー</Text>
            <Text style={styles.rewardText}>
              サイズ: {size === 'Small' ? '10pt' : size === 'Medium' ? '25pt' : '50pt'}
            </Text>
            <Text style={styles.rewardText}>
              期限設定: {dueDate ? '+5pt' : '0pt'}
            </Text>
            <Text style={styles.rewardText}>
              優先度: +{priority * 3}pt
            </Text>
            <Text style={styles.rewardText}>
              タグ: +{(isRecoveryTask ? 1 : 0) + (isMentalCareTask ? 1 : 0) + (isLearningTask ? 1 : 0) * 2}pt
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>キャンセル</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  sizeButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  sizeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  sizeButtonTextActive: {
    color: '#6366f1',
  },
  sizeLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  priorityButtonTextActive: {
    color: '#ef4444',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  rewardPreview: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButtonText: {
    color: '#fff',
  },
});

export default GamifiedTaskFormScreen;
