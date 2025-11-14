import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/appStyles';

/**
 * Composant pour afficher un état vide
 */
export const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{icon}</Text>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
  </View>
);
