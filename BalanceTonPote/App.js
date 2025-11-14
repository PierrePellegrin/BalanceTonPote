import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';

// Hooks personnalisés
import { useAuth, useDatabase, useBalancages } from './hooks/useApp';

// Écrans
import { DashboardScreen } from './screens/DashboardScreen';
import { DossiersScreen } from './screens/DossiersScreen';
import { BalancerScreen } from './screens/BalancerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import AuthScreen from './components/AuthScreen';
import { EditBalancageModal } from './components/EditBalancageModal';

// Utils
import { getUserDisplayName } from './utils/userUtils';

// Constantes
import { TABS, DOSSIERS_TABS } from './constants/theme';

// Styles
import { styles } from './styles/appStyles';

// Supabase functions
import { signUp, signIn, signOut } from './lib/supabase';

export default function App() {
  // États de navigation
  const [currentTab, setCurrentTab] = useState(TABS.DASHBOARD);
  const [dossiersTab, setDossiersTab] = useState(DOSSIERS_TABS.TOUS);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isLogin, setIsLogin] = useState(true);

  // États du formulaire
  const [nomPote, setNomPote] = useState('');
  const [nomBalanceur, setNomBalanceur] = useState('');
  const [showNewSuspectInput, setShowNewSuspectInput] = useState(false);
  const [typeAction, setTypeAction] = useState('');
  const [autorite, setAutorite] = useState('');
  const [description, setDescription] = useState('');

  // Hooks personnalisés
  const { user, authLoading } = useAuth();
  const { db, useSupabase } = useDatabase();
  const { balancages, usersList, loadBalancages, loadUsers, saveBalancage, updateBalancage, deleteBalancage } = useBalancages(db, useSupabase, user);

  // État pour le modal d'édition
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [balancageToEdit, setBalancageToEdit] = useState(null);

  // Reset l'autorité quand le type d'action change
  useEffect(() => {
    setAutorite('');
  }, [typeAction]);

  // Charger les balançages quand on change d'onglet
  useEffect(() => {
    if (currentTab === TABS.DASHBOARD || currentTab === TABS.DOSSIERS) {
      loadBalancages();
      loadUsers();
    }
  }, [currentTab]);

  // Pré-remplir le nom du balanceur
  useEffect(() => {
    if (user && !nomBalanceur.trim()) {
      const nomUtilisateur = getUserDisplayName(user);
      setNomBalanceur(nomUtilisateur);
    }
  }, [user, currentTab]);

  // Gérer l'expansion/réduction des groupes
  const toggleExpanded = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Soumettre un balançage
  const balancerPote = async () => {
    if (!nomPote.trim() || !nomBalanceur.trim() || !typeAction || !autorite || !description.trim()) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires pour procéder au balançage !');
      return;
    }

    try {
      const balancageData = {
        nom_pote: nomPote.trim(),
        nom_balanceur: nomBalanceur.trim(),
        type_action: typeAction,
        autorite: autorite,
        description: description.trim(),
        user_id: user?.id
      };

      await saveBalancage(balancageData);
      
      Alert.alert(
        'Balançage Effectué !', 
        `Le suspect ${nomPote} a été dénoncé avec succès aux autorités compétentes (${autorite}) pour ${typeAction.toLowerCase()}.`,
        [
          {
            text: 'Continuer l\'enquête',
            onPress: () => {
              setNomPote('');
              setShowNewSuspectInput(false);
              setNomBalanceur(getUserDisplayName(user));
              setTypeAction('');
              setAutorite('');
              setDescription('');
              if (currentTab === TABS.DASHBOARD || currentTab === TABS.DOSSIERS) {
                loadBalancages();
              }
              loadUsers();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'enregistrement du balançage: ' + error.message);
      console.log('Erreur:', error);
    }
  };

  // Gérer l'authentification
  const handleAuth = async (email, password, nom = null) => {
    try {
      if (isLogin) {
        const { user } = await signIn(email, password);
        Alert.alert('✅ Connexion Réussie', `Bienvenue ${user.email} !`);
      } else {
        const { user } = await signUp(email, password, nom);
        Alert.alert('✅ Compte Créé', 'Vérifiez votre email pour confirmer votre compte. Vous pouvez maintenant vous connecter.', [
          {
            text: 'Se connecter',
            onPress: () => setIsLogin(true)
          }
        ]);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Déconnexion
  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('👋 Déconnexion', 'À bientôt !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  // Ouvrir le modal d'édition
  const handleEditBalancage = (balancage) => {
    setBalancageToEdit(balancage);
    setEditModalVisible(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async (id, updates) => {
    try {
      await updateBalancage(id, updates);
      setEditModalVisible(false);
      setBalancageToEdit(null);
      await loadBalancages();
      Alert.alert('✅ SUCCÈS', 'Le dossier a été modifié avec succès');
    } catch (error) {
      Alert.alert('❌ ERREUR', error.message || 'Erreur lors de la modification du dossier');
    }
  };

  // Supprimer un balançage
  const handleDeleteBalancage = async (id) => {
    try {
      await deleteBalancage(id);
      await loadBalancages();
      Alert.alert('✅ SUCCÈS', 'Le dossier a été supprimé avec succès');
    } catch (error) {
      Alert.alert('❌ ERREUR', error.message || 'Erreur lors de la suppression du dossier');
    }
  };

  // Affichage de chargement
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Image 
            source={require('./assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.loadingSubtitle}>Vérification des autorisations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage de l'authentification
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AuthScreen 
          onLogin={handleAuth}
          onSwitchToRegister={() => setIsLogin(!isLogin)}
          isLogin={isLogin}
        />
      </SafeAreaView>
    );
  }

  // Rendu de l'écran actif
  const renderCurrentScreen = () => {
    switch (currentTab) {
      case TABS.BALANCER:
        return (
          <BalancerScreen 
            nomPote={nomPote}
            setNomPote={setNomPote}
            nomBalanceur={nomBalanceur}
            setNomBalanceur={setNomBalanceur}
            typeAction={typeAction}
            setTypeAction={setTypeAction}
            autorite={autorite}
            setAutorite={setAutorite}
            description={description}
            setDescription={setDescription}
            usersList={usersList}
            showNewSuspectInput={showNewSuspectInput}
            setShowNewSuspectInput={setShowNewSuspectInput}
            onSubmit={balancerPote}
          />
        );
      case TABS.DOSSIERS:
        return (
          <DossiersScreen 
            balancages={balancages}
            dossiersTab={dossiersTab}
            setDossiersTab={setDossiersTab}
            expandedGroups={expandedGroups}
            onToggleExpanded={toggleExpanded}
            currentUserId={user?.id}
            onEditBalancage={handleEditBalancage}
            onDeleteBalancage={handleDeleteBalancage}
          />
        );
      case TABS.SETTINGS:
        return (
          <SettingsScreen 
            user={user}
            onSignOut={handleSignOut}
          />
        );
      default:
        return <DashboardScreen balancages={balancages} />;
    }
  };

  // Affichage principal
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.mainContent}>
        {renderCurrentScreen()}
      </View>

      {/* Menu de navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navTab, currentTab === TABS.DASHBOARD && styles.navTabActive]}
          onPress={() => setCurrentTab(TABS.DASHBOARD)}
        >
          <MaterialIcons 
            name="analytics" 
            size={24} 
            color={currentTab === TABS.DASHBOARD ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === TABS.DASHBOARD && styles.navLabelActive]}>
            DASHBOARD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === TABS.DOSSIERS && styles.navTabActive]}
          onPress={() => setCurrentTab(TABS.DOSSIERS)}
        >
          <MaterialCommunityIcons 
            name="folder-open" 
            size={24} 
            color={currentTab === TABS.DOSSIERS ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === TABS.DOSSIERS && styles.navLabelActive]}>
            DOSSIERS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === TABS.BALANCER && styles.navTabActive]}
          onPress={() => setCurrentTab(TABS.BALANCER)}
        >
          <MaterialCommunityIcons 
            name="target" 
            size={24} 
            color={currentTab === TABS.BALANCER ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === TABS.BALANCER && styles.navLabelActive]}>
            BALANCER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === TABS.SETTINGS && styles.navTabActive]}
          onPress={() => setCurrentTab(TABS.SETTINGS)}
        >
          <Ionicons 
            name="settings-sharp" 
            size={24} 
            color={currentTab === TABS.SETTINGS ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === TABS.SETTINGS && styles.navLabelActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal d'édition */}
      <EditBalancageModal 
        visible={editModalVisible}
        balancage={balancageToEdit}
        onClose={() => {
          setEditModalVisible(false);
          setBalancageToEdit(null);
        }}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}
