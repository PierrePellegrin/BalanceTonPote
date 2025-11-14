import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { styles } from '../styles/appStyles';

/**
 * Écran des paramètres
 */
export const SettingsScreen = ({ user, onSignOut }) => {
  return (
    <View style={styles.settingsContainer}>
      <ScreenHeader 
        icon="settings-sharp"
        iconSet="Ionicons"
        title="PARAMÈTRES"
        subtitle="CONFIGURATION DU TRIBUNAL"
      />
      
      <View style={styles.settingsContent}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>👤 COMPTE INFORMATEUR</Text>
          
          {user && (
            <View style={styles.userInfoCard}>
              <Text style={styles.userInfoLabel}>EMAIL :</Text>
              <Text style={styles.userInfoValue}>{user.email}</Text>
              
              <Text style={styles.userInfoLabel}>NOM :</Text>
              <Text style={styles.userInfoValue}>{user.user_metadata?.nom || 'Non défini'}</Text>
              
              <Text style={styles.userInfoLabel}>STATUT :</Text>
              <Text style={[styles.userInfoValue, { color: '#4CAF50' }]}>Informateur Actif</Text>
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>🚪 SESSION</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={onSignOut}>
            <Text style={styles.logoutButtonText}>🚪 DÉCONNEXION</Text>
          </TouchableOpacity>
          <Text style={styles.logoutDescription}>
            Se déconnecter du tribunal et retourner à l'écran d'identification
          </Text>
        </View>
      </View>
    </View>
  );
};
