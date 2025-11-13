import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { supabase, initializeDatabase, insertBalancage, getAllBalancages, signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from './lib/supabase';
import AuthScreen from './components/AuthScreen';

let db;

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // Dashboard comme page d'accueil
  const [nomPote, setNomPote] = useState('');
  const [nomBalanceur, setNomBalanceur] = useState('');
  const [typeAction, setTypeAction] = useState('');
  const [autorite, setAutorite] = useState('');
  const [description, setDescription] = useState('');
  const [balancages, setBalancages] = useState([]);
  const [useSupabase, setUseSupabase] = useState(true); // Toujours utiliser Supabase par défaut
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const typesActions = [
    { label: 'Sélectionner un type...', value: '' },
    { label: 'Crime', value: 'Crime' },
    { label: 'Détournement', value: 'Détournement' },
    { label: 'Adultère', value: 'Adultère' },
    { label: 'Mauvaise action', value: 'Mauvaise action' }
  ];

  const getAutorites = () => {
    switch(typeAction) {
      case 'Crime':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Police', value: 'Police' },
          { label: 'FBI', value: 'FBI' },
          { label: 'CIA', value: 'CIA' },
          { label: 'GIGN', value: 'GIGN' },
          { label: 'Gendarme de St Tropez', value: 'Gendarme de St Tropez' }
        ];
      case 'Détournement':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Impôts', value: 'Impôts' },
          { label: 'URSSAF', value: 'URSSAF' },
          { label: 'CAF', value: 'CAF' }
        ];
      case 'Adultère':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Femme', value: 'Femme' },
          { label: 'Conjointe', value: 'Conjointe' },
          { label: 'Belle mère', value: 'Belle mère' }
        ];
      case 'Mauvaise action':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Père Noël', value: 'Père Noël' },
          { label: 'Lapin de Pâques', value: 'Lapin de Pâques' }
        ];
      default:
        return [{ label: 'Sélectionner d\'abord un type...', value: '' }];
    }
  };

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    const checkAuthState = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log('Erreur vérification auth:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthState();

    // Écouter les changements d'authentification
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        console.log('Utilisateur connecté:', session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('Utilisateur déconnecté');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Initialiser la base de données - Priorité à Supabase pour partage multi-utilisateurs
    const initDatabase = async () => {
      try {
        // Essayer d'abord Supabase (base partagée)
        await initializeDatabase();
        console.log('Supabase initialisé avec succès - Base partagée disponible');
        setUseSupabase(true);
        setConnectionStatus('online');
      } catch (error) {
        console.log('Erreur Supabase, fallback vers SQLite local:', error);
        // Fallback vers SQLite si Supabase indisponible
        setUseSupabase(false);
        setConnectionStatus('offline');
        
        try {
          db = await SQLite.openDatabaseAsync('balanceTonPote.db');
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS balancages (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              nom_pote TEXT, 
              nom_balanceur TEXT, 
              type_action TEXT, 
              autorite TEXT, 
              description TEXT, 
              date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          console.log('Base de données SQLite initialisée avec succès (mode offline)');
        } catch (sqliteError) {
          console.log('Erreur lors de l\'initialisation SQLite:', sqliteError);
        }
      }
    };
    
    initDatabase();
  }, []);

  useEffect(() => {
    // Reset l'autorité quand le type d'action change
    setAutorite('');
  }, [typeAction]);

  useEffect(() => {
    // Charger les balançages quand on passe au dashboard
    if (currentTab === 'dashboard') {
      loadBalancages();
    }
  }, [currentTab]);

  const loadBalancages = async () => {
    try {
      if (useSupabase) {
        // Charger depuis Supabase - tous les balançages (mode public)
        // Note: Si RLS est activé, seuls les balançages de l'utilisateur seront visibles
        const data = await getAllBalancages();
        setBalancages(data || []);
      } else {
        // Charger depuis SQLite
        if (!db) return;
        const result = await db.getAllAsync('SELECT * FROM balancages ORDER BY date_creation DESC');
        setBalancages(result || []);
      }
    } catch (error) {
      console.log('Erreur lors du chargement des balançages:', error);
      setBalancages([]);
    }
  };

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
        user_id: user?.id // Ajouter l'ID de l'utilisateur connecté
      };

      if (useSupabase) {
        // Sauvegarder via Supabase
        await insertBalancage(balancageData);
      } else {
        // Sauvegarder via SQLite
        if (!db) {
          Alert.alert('Erreur', 'Base de données non initialisée');
          return;
        }
        await db.runAsync(
          'INSERT INTO balancages (nom_pote, nom_balanceur, type_action, autorite, description) VALUES (?, ?, ?, ?, ?)',
          [balancageData.nom_pote, balancageData.nom_balanceur, balancageData.type_action, balancageData.autorite, balancageData.description]
        );
      }
      
      Alert.alert(
        'Balançage Effectué !', 
        `Le suspect ${nomPote} a été dénoncé avec succès aux autorités compétentes (${autorite}) pour ${typeAction.toLowerCase()}.`,
        [
          {
            text: 'Continuer l\'enquête',
            onPress: () => {
              setNomPote('');
              setNomBalanceur('');
              setTypeAction('');
              setAutorite('');
              setDescription('');
              // Recharger les balançages si on est sur le dashboard
              if (currentTab === 'dashboard') {
                loadBalancages();
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'enregistrement du balançage: ' + error.message);
      console.log('Erreur:', error);
    }
  };

  const tryReconnectSupabase = async () => {
    setConnectionStatus('connecting');
    try {
      await initializeDatabase();
      setUseSupabase(true);
      setConnectionStatus('online');
      Alert.alert('✅ Connexion Rétablie', 'Vous êtes maintenant connecté à la base partagée !');
      loadBalancages(); // Recharger les données
    } catch (error) {
      setUseSupabase(false);
      setConnectionStatus('offline');
      Alert.alert('❌ Connexion Échouée', 'Impossible de se connecter à la base partagée. Mode offline maintenu.');
    }
  };

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
            onPress: () => setIsLogin(true) // Rediriger vers la page de login
          }
        ]);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('👋 Déconnexion', 'À bientôt !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderBalancageCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>🕵️ DOSSIER #{item.id}</Text>
        <Text style={styles.cardDate}>{formatDate(item.date_creation)}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>SUSPECT :</Text>
          <Text style={styles.cardValue}>{item.nom_pote}</Text>
        </View>
        
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>DÉNONCÉ PAR :</Text>
          <Text style={styles.cardValue}>{item.nom_balanceur}</Text>
        </View>
        
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>TYPE DE CRIME :</Text>
          <Text style={[styles.cardValue, styles.crimeType]}>{item.type_action}</Text>
        </View>
        
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>AUTORITÉ :</Text>
          <Text style={styles.cardValue}>{item.autorite}</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.cardLabel}>DÉTAILS DE L'ACCUSATION :</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>⚖️ DOSSIER TRANSMIS</Text>
      </View>
    </View>
  );

  const renderBalancerScreen = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🕵️ BALANCE TON POTE 🕵️</Text>
        <Text style={styles.subtitle}>TRIBUNAL DE L'INQUISITION MODERNE</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOM DU SUSPECT :</Text>
          <TextInput
            style={styles.input}
            value={nomPote}
            onChangeText={setNomPote}
            placeholder="Identité du coupable..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>DÉNONCÉ PAR :</Text>
          <TextInput
            style={styles.input}
            value={nomBalanceur}
            onChangeText={setNomBalanceur}
            placeholder="Votre identité d'informateur..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>TYPE DE CRIME :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={typeAction}
              style={styles.picker}
              onValueChange={setTypeAction}
              dropdownIconColor="#D4AF37"
            >
              {typesActions.map((type, index) => (
                <Picker.Item 
                  key={index} 
                  label={type.label} 
                  value={type.value}
                  color={type.value === '' ? '#666' : '#000'}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>AUTORITÉ COMPÉTENTE :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={autorite}
              style={styles.picker}
              onValueChange={setAutorite}
              dropdownIconColor="#D4AF37"
              enabled={typeAction !== ''}
            >
              {getAutorites().map((auth, index) => (
                <Picker.Item 
                  key={index} 
                  label={auth.label} 
                  value={auth.value}
                  color={auth.value === '' ? '#666' : '#000'}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>DÉTAILS DE L'ACCUSATION :</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez les méfaits du suspect en détail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={balancerPote}>
          <Text style={styles.submitButtonText}>⚖️ PROCÉDER AU BALANÇAGE ⚖️</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDashboardScreen = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 DASHBOARD D'ENQUÊTE 📋</Text>
        <Text style={styles.subtitle}>ARCHIVES DES BALANÇAGES</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 TOTAL DES DOSSIERS : {balancages.length}
        </Text>
        <View style={styles.connectionStatus}>
          <Text style={[styles.dbIndicator, { color: useSupabase ? '#4CAF50' : '#FF6B6B' }]}>
            {connectionStatus === 'connecting' ? '� Connexion...' : 
             useSupabase ? '🌐 Base Partagée (Online)' : '📱 Base Locale (Offline)'}
          </Text>
          {!useSupabase && connectionStatus === 'offline' && (
            <TouchableOpacity style={styles.reconnectButton} onPress={tryReconnectSupabase}>
              <Text style={styles.reconnectButtonText}>🔄 Reconnecter</Text>
            </TouchableOpacity>
          )}
        </View>
        {useSupabase && (
          <Text style={styles.multiUserInfo}>
            👥 Base partagée - Visible par tous les utilisateurs
          </Text>
        )}
      </View>

      {balancages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🕵️</Text>
          <Text style={styles.emptyStateTitle}>AUCUN BALANÇAGE</Text>
          <Text style={styles.emptyStateSubtitle}>
            Commencez par dénoncer un suspect dans l'onglet "Balancer"
          </Text>
        </View>
      ) : (
        <FlatList
          data={balancages}
          renderItem={renderBalancageCard}
          keyExtractor={(item) => item.id.toString()}
          style={styles.cardList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ PARAMÈTRES ⚙️</Text>
        <Text style={styles.subtitle}>CONFIGURATION DU TRIBUNAL</Text>
      </View>
      
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
          <Text style={styles.sectionTitle}>🌐 CONNEXION</Text>
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionLabel}>Base de données :</Text>
            <Text style={[styles.connectionValue, { color: useSupabase ? '#4CAF50' : '#FF6B6B' }]}>
              {useSupabase ? '🌐 Cloud (Supabase)' : '📱 Local (SQLite)'}
            </Text>
            <Text style={styles.connectionLabel}>Statut :</Text>
            <Text style={[styles.connectionValue, { color: connectionStatus === 'online' ? '#4CAF50' : '#FF6B6B' }]}>
              {connectionStatus === 'connecting' ? '🔄 Connexion...' : 
               connectionStatus === 'online' ? '✅ Connecté' : '❌ Hors ligne'}
            </Text>
          </View>
          
          {!useSupabase && connectionStatus === 'offline' && (
            <TouchableOpacity style={styles.reconnectButton} onPress={tryReconnectSupabase}>
              <Text style={styles.reconnectButtonText}>🔄 Reconnecter à la base cloud</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>🚪 SESSION</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutButtonText}>🚪 DÉCONNEXION</Text>
          </TouchableOpacity>
          <Text style={styles.logoutDescription}>
            Se déconnecter du tribunal et retourner à l'écran d'identification
          </Text>
        </View>
      </View>
    </View>
  );

  // Affichage de chargement
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🕵️</Text>
          <Text style={styles.loadingTitle}>BALANCE TON POTE</Text>
          <Text style={styles.loadingSubtitle}>Vérification des autorisations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage de l'authentification si pas connecté
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

  // Affichage principal de l'application
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Contenu principal */}
      <View style={styles.mainContent}>
        {currentTab === 'balancer' ? renderBalancerScreen() : 
         currentTab === 'settings' ? renderSettingsScreen() : 
         renderDashboardScreen()}
      </View>

      {/* Menu de navigation en bas */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'dashboard' && styles.navButtonActive]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <Text style={[styles.navButtonText, currentTab === 'dashboard' && styles.navButtonTextActive]}>
            📋 DASHBOARD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'balancer' && styles.navButtonActive]}
          onPress={() => setCurrentTab('balancer')}
        >
          <Text style={[styles.navButtonText, currentTab === 'balancer' && styles.navButtonTextActive]}>
            🕵️ BALANCER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'settings' && styles.navButtonActive]}
          onPress={() => setCurrentTab('settings')}
        >
          <Text style={[styles.navButtonText, currentTab === 'settings' && styles.navButtonTextActive]}>
            ⚙️ SETTINGS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espace pour la navigation
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    paddingBottom: 20,
    paddingTop: 20, // Espace pour éviter les icônes Android
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    textShadowColor: '#8B0000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 2,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Styles pour la navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderTopWidth: 2,
    borderTopColor: '#8B0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B0000',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  navButtonActive: {
    backgroundColor: '#8B0000',
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navButtonTextActive: {
    color: '#D4AF37',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Styles pour le dashboard
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  statsText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dbIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectionStatus: {
    alignItems: 'center',
    marginTop: 8,
  },
  reconnectButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  reconnectButtonText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
  },
  multiUserInfo: {
    color: '#4CAF50',
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  userInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 5,
    alignItems: 'center',
  },
  userInfoText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  logoutButtonText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    textShadowColor: '#8B0000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: '#8B0000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cardList: {
    flex: 1,
  },
  // Styles pour les cards
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#8B0000',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardBody: {
    padding: 15,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  cardLabel: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    width: 120,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  crimeType: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cardDescription: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
    fontStyle: 'italic',
  },
  cardFooter: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  cardStatus: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  // Styles pour Settings
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userInfoCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  userInfoLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  userInfoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  connectionInfo: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
  },
  connectionLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  connectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutDescription: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
