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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/Task';

type RootStackParamList = {
  Home: undefined;
  TaskForm: { task?: Task };
};

type TaskFormScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TaskForm'
>;

type TaskFormScreenRouteProp = RouteProp<RootStackParamList, 'TaskForm'>;

interface TaskFormScreenProps {
  navigation: TaskFormScreenNavigationProp;
  route: TaskFormScreenRouteProp;
}

export const TaskFormScreen: React.FC<TaskFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { addTask, updateTask } = useTaskContext();
  const { task } = route.params || {};

  const [title, setTitle] = useState(task?.title || '');
  const [detail, setDetail] = useState(task?.detail || '');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: task ? 'タスク編集' : 'タスク追加',
    });
  }, [navigation, task]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('タスク名を入力してください');
      return;
    }

    if (task) {
      updateTask(task.id, title.trim(), detail.trim());
    } else {
      addTask(title.trim(), detail.trim());
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
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
