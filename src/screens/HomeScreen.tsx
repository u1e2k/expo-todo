import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTaskContext } from '../context/TaskContext';
import { TaskList } from '../components/TaskList';
import { FilterButtons } from '../components/FilterButtons';
import { Task } from '../types/Task';

type RootStackParamList = {
  Home: undefined;
  TaskForm: { task?: Task };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { filter, setFilter, toggleTask, deleteTask, getFilteredTasks } =
    useTaskContext();

  const filteredTasks = getFilteredTasks();

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskForm', { task });
  };

  const handleAddTask = () => {
    navigation.navigate('TaskForm', {});
  };

  return (
    <View style={styles.container}>
      <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
      <TaskList
        tasks={filteredTasks}
        onTaskPress={handleTaskPress}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
