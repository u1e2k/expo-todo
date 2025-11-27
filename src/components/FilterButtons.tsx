import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FilterType } from '../types/Task';

interface FilterButtonsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'すべて', value: 'all' },
    { label: '未完了', value: 'active' },
    { label: '完了済み', value: 'completed' },
    { label: 'プロジェクト', value: 'project' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          style={[
            styles.button,
            currentFilter === filter.value && styles.activeButton,
          ]}
          onPress={() => onFilterChange(filter.value)}
        >
          <Text
            style={[
              styles.buttonText,
              currentFilter === filter.value && styles.activeButtonText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  activeButtonText: {
    color: '#fff',
  },
});
