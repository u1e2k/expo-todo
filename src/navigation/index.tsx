import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskProvider } from '../context/TaskContext';
import { UserStatusProvider } from '../context/UserStatusContext';
import { GamifiedTaskProvider } from '../context/GamifiedTaskContext';
import { HomeScreen } from '../screens/HomeScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import GamifiedHomeScreen from '../screens/GamifiedHomeScreen';
import GamifiedTaskFormScreen from '../screens/GamifiedTaskFormScreen';
import StatusScreen from '../screens/StatusScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import { Task, ITask } from '../types/Task';

type RootStackParamList = {
  Home: undefined;
  TaskForm: { task?: Task };
  GamifiedHome: undefined;
  GamifiedTaskForm: { task?: ITask; parentId?: string };
  Status: undefined;
  Pomodoro: undefined;
  ProjectDetail: { projectId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  return (
    <UserStatusProvider>
      <GamifiedTaskProvider>
        <TaskProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="GamifiedHome"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#6366f1',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Gamified版画面 */}
              <Stack.Screen
                name="GamifiedHome"
                component={GamifiedHomeScreen}
                options={{ title: '🎮 Gamified TODO' }}
              />
              <Stack.Screen
                name="GamifiedTaskForm"
                component={GamifiedTaskFormScreen}
                options={{ title: 'タスク' }}
              />
              <Stack.Screen
                name="Status"
                component={StatusScreen}
                options={{ title: 'ステータス' }}
              />
              <Stack.Screen
                name="Pomodoro"
                component={PomodoroScreen}
                options={{ title: 'ポモドーロ' }}
              />
              <Stack.Screen
                name="ProjectDetail"
                component={ProjectDetailScreen}
                options={{ title: 'プロジェクト詳細' }}
              />

              {/* 旧版画面（互換性） */}
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Todo App' }}
              />
              <Stack.Screen
                name="TaskForm"
                component={TaskFormScreen}
                options={{ title: 'タスク' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </TaskProvider>
      </GamifiedTaskProvider>
    </UserStatusProvider>
  );
};
