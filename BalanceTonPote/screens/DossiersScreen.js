import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmptyState } from '../components/EmptyState';
import { BalancageCard } from '../components/BalancageCard';
import { ExpandableGroup } from '../components/ExpandableGroup';
import { getBalancagesParSuspect, getBalancagesParBalanceur } from '../utils/statsUtils';
import { DOSSIERS_TABS } from '../constants/theme';
import { styles } from '../styles/appStyles';

/**
 * Écran des dossiers d'enquête
 */
export const DossiersScreen = ({ 
  balancages, 
  dossiersTab, 
  setDossiersTab,
  expandedGroups,
  onToggleExpanded,
  currentUserId,
  onEditBalancage,
  onDeleteBalancage
}) => {
  return (
    <View style={styles.dashboardContainer}>
      <ScreenHeader 
        icon="folder-open"
        title="DOSSIERS D'ENQUÊTE"
        subtitle="ARCHIVES DES BALANÇAGES"
      />

      {/* Onglets des dossiers */}
      <View style={styles.dossiersTabsContainer}>
        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === DOSSIERS_TABS.TOUS && styles.dossiersTabActive]}
          onPress={() => setDossiersTab(DOSSIERS_TABS.TOUS)}
        >
          <MaterialCommunityIcons 
            name="folder-multiple" 
            size={20} 
            color={dossiersTab === DOSSIERS_TABS.TOUS ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === DOSSIERS_TABS.TOUS && styles.dossiersTabTextActive]}>
            TOUS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === DOSSIERS_TABS.SUSPECT && styles.dossiersTabActive]}
          onPress={() => setDossiersTab(DOSSIERS_TABS.SUSPECT)}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={dossiersTab === DOSSIERS_TABS.SUSPECT ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === DOSSIERS_TABS.SUSPECT && styles.dossiersTabTextActive]}>
            PAR SUSPECT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === DOSSIERS_TABS.BALANCE && styles.dossiersTabActive]}
          onPress={() => setDossiersTab(DOSSIERS_TABS.BALANCE)}
        >
          <MaterialIcons 
            name="report" 
            size={20} 
            color={dossiersTab === DOSSIERS_TABS.BALANCE ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === DOSSIERS_TABS.BALANCE && styles.dossiersTabTextActive]}>
            PAR BALANCE
          </Text>
        </TouchableOpacity>
      </View>

      {balancages.length === 0 ? (
        <EmptyState 
          icon="🎯"
          title="AUCUN DOSSIER"
          subtitle="Commencez par dénoncer un suspect dans l'onglet Balancer"
        />
      ) : (
        <View style={styles.dossiersContent}>
          {dossiersTab === DOSSIERS_TABS.TOUS ? (
            <FlatList
              data={balancages}
              renderItem={({ item }) => (
                <BalancageCard 
                  item={item} 
                  currentUserId={currentUserId}
                  onEdit={onEditBalancage}
                  onDelete={onDeleteBalancage}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              style={styles.cardList}
              showsVerticalScrollIndicator={false}
            />
          ) : dossiersTab === DOSSIERS_TABS.SUSPECT ? (
            <ScrollView style={styles.expandableList} showsVerticalScrollIndicator={false}>
              {getBalancagesParSuspect(balancages).map((group) => (
                <ExpandableGroup 
                  key={`suspect_${group.nom}`}
                  group={group}
                  type="suspect"
                  isExpanded={expandedGroups[`suspect_${group.nom}`]}
                  onToggle={() => onToggleExpanded(`suspect_${group.nom}`)}
                  currentUserId={currentUserId}
                  onEdit={onEditBalancage}
                  onDelete={onDeleteBalancage}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.expandableList} showsVerticalScrollIndicator={false}>
              {getBalancagesParBalanceur(balancages).map((group) => (
                <ExpandableGroup 
                  key={`balance_${group.nom}`}
                  group={group}
                  type="balance"
                  isExpanded={expandedGroups[`balance_${group.nom}`]}
                  onToggle={() => onToggleExpanded(`balance_${group.nom}`)}
                  currentUserId={currentUserId}
                  onEdit={onEditBalancage}
                  onDelete={onDeleteBalancage}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};
