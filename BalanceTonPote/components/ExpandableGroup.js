import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BalancageCard } from './BalancageCard';
import { styles } from '../styles/appStyles';

/**
 * Composant pour afficher un groupe expandable de balançages
 */
export const ExpandableGroup = ({ group, type, isExpanded, onToggle, currentUserId, onEdit, onDelete }) => {
  const groupKey = `${type}_${group.nom}`;
  
  return (
    <View key={groupKey} style={styles.expandableGroup}>
      <TouchableOpacity 
        style={styles.expandableHeader}
        onPress={onToggle}
      >
        <View style={styles.expandableHeaderLeft}>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#D4AF37" 
          />
          <View style={styles.expandableHeaderText}>
            <Text style={styles.expandableTitle}>{group.nom}</Text>
            <Text style={styles.expandableSubtitle}>
              {group.count} dossier{group.count > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.expandableBadge}>
          <Text style={styles.expandableBadgeText}>{group.count}</Text>
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandableContent}>
          {group.dossiers.map((dossier) => (
            <View key={dossier.id} style={styles.expandableCard}>
              <BalancageCard 
                item={dossier} 
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
