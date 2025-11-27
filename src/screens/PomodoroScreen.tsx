import React from 'react';
import { View, StyleSheet } from 'react-native';
import PomodoroTimer from '../components/PomodoroTimer';

const PomodoroScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <PomodoroTimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default PomodoroScreen;
