import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskProvider } from '../context/TaskContext';
import { HomeScreen } from '../screens/HomeScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { Task } from '../types/Task';

type RootStackParamList = {
  Home: undefined;
  TaskForm: { task?: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  return (
    <TaskProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
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
  );
};
