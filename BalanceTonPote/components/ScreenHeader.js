import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/appStyles';

/**
 * Composant Header réutilisable pour les écrans
 */
export const ScreenHeader = ({ icon, title, subtitle, iconSet = 'MaterialCommunityIcons' }) => {
  const Icon = iconSet === 'MaterialIcons' ? MaterialIcons : 
               iconSet === 'Ionicons' ? Ionicons : 
               MaterialCommunityIcons;

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Icon name={icon} size={28} color="#D4AF37" />
        <Text style={styles.title}>{title}</Text>
        <Icon name={icon} size={28} color="#D4AF37" />
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};
