import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles/appStyles';
import { formatDate } from '../utils/dateUtils';

/**
 * Composant Card pour afficher un balançage
 */
export const BalancageCard = ({ item, currentUserId, onEdit, onDelete }) => {
  const isOwner = item.user_id === currentUserId;

  const handleDelete = () => {
    Alert.alert(
      '⚠️ CONFIRMATION',
      `Êtes-vous sûr de vouloir supprimer le dossier #${item.id} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onDelete(item.id)
        }
      ]
    );
  };

  return (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleContainer}>
        <MaterialCommunityIcons name="folder-open" size={20} color="#D4AF37" />
        <Text style={styles.cardTitle}>DOSSIER #{item.id}</Text>
      </View>
      <View style={styles.cardHeaderRight}>
        <Text style={styles.cardDate}>{formatDate(item.date_creation)}</Text>
        {isOwner && (
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.cardActionButton}>
              <MaterialCommunityIcons name="pencil" size={18} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.cardActionButton}>
              <MaterialCommunityIcons name="delete" size={18} color="#8B0000" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
    
    <View style={styles.cardBody}>
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <View style={styles.infoCell}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="person" size={16} color="#8B0000" />
              <Text style={styles.infoLabel}>SUSPECT</Text>
            </View>
            <Text style={styles.infoValue}>{item.nom_pote}</Text>
          </View>
          <View style={styles.infoCell}>
            <View style={styles.infoLabelContainer}>
              <MaterialIcons name="report" size={16} color="#8B0000" />
              <Text style={styles.infoLabel}>DÉNONCÉ PAR</Text>
            </View>
            <Text style={styles.infoValue}>{item.nom_balanceur}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoCell}>
            <View style={styles.infoLabelContainer}>
              <MaterialIcons name="gavel" size={16} color="#8B0000" />
              <Text style={styles.infoLabel}>CRIME</Text>
            </View>
            <Text style={[styles.infoValue, styles.crimeType]}>{item.type_action}</Text>
          </View>
          <View style={styles.infoCell}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="shield-star" size={16} color="#8B0000" />
              <Text style={styles.infoLabel}>AUTORITÉ</Text>
            </View>
            <Text style={styles.infoValue}>{item.autorite}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.descriptionSection}>
        <View style={styles.descriptionTitleContainer}>
          <MaterialIcons name="description" size={18} color="#D4AF37" />
          <Text style={styles.descriptionTitle}>DÉTAILS DE L'ACCUSATION</Text>
        </View>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </View>
    </View>
  </View>
  );
};
