import React from 'react';
import { View, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import { styles } from '../styles/appStyles';
import { getStatsParType, getStatsParCoupable, getStatsParBalanceur } from '../utils/statsUtils';

/**
 * Écran Dashboard avec statistiques
 */
export const DashboardScreen = ({ balancages }) => {
  return (
    <View style={styles.dashboardContainer}>
      <ScreenHeader 
        icon="analytics"
        iconSet="MaterialIcons"
        title="DASHBOARD D'ENQUÊTE"
        subtitle="STATISTIQUES DU TRIBUNAL"
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 TOTAL DES DOSSIERS : {balancages.length}
        </Text>
        
        {balancages.length > 0 ? (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🏷️ CRIMES PAR TYPE</Text>
              {Object.entries(getStatsParType(balancages)).map(([type, count]) => {
                const percentage = Math.round((count / balancages.length) * 100);
                return (
                  <View key={type} style={styles.statsRow}>
                    <Text style={styles.statsLabel}>{type} :</Text>
                    <Text style={styles.statsValue}>{count} ({percentage}%)</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🎯 TOP COUPABLES</Text>
              {getStatsParCoupable(balancages).map((coupable, index) => {
                const percentage = Math.round((coupable.count / balancages.length) * 100);
                return (
                  <View key={coupable.nom} style={styles.statsRow}>
                    <Text style={styles.statsLabel}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {coupable.nom} :
                    </Text>
                    <Text style={styles.statsValue}>{coupable.count} ({percentage}%)</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🏅 TOP BALANCES</Text>
              {getStatsParBalanceur(balancages).map((balanceur, index) => {
                const percentage = Math.round((balanceur.count / balancages.length) * 100);
                return (
                  <View key={balanceur.nom} style={styles.statsRow}>
                    <Text style={styles.statsLabel}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {balanceur.nom} :
                    </Text>
                    <Text style={styles.statsValue}>{balanceur.count} ({percentage}%)</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <EmptyState 
            icon="📊"
            title="AUCUNE STATISTIQUE"
            subtitle="Les statistiques apparaîtront quand des dossiers seront créés"
          />
        )}
      </View>
    </View>
  );
};
