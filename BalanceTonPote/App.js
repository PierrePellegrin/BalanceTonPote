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
  FlatList,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { supabase, initializeDatabase, insertBalancage, getAllBalancages, getAllUsers, signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from './lib/supabase';
import AuthScreen from './components/AuthScreen';

let db;

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // Dashboard comme page d'accueil
  const [nomPote, setNomPote] = useState('');
  const [nomBalanceur, setNomBalanceur] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [showNewSuspectInput, setShowNewSuspectInput] = useState(false);
  const [typeAction, setTypeAction] = useState('');
  const [autorite, setAutorite] = useState('');
  const [description, setDescription] = useState('');
  const [balancages, setBalancages] = useState([]);
  const [useSupabase, setUseSupabase] = useState(true); // Toujours utiliser Supabase par défaut
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [dossiersTab, setDossiersTab] = useState('tous'); // Onglet actuel des dossiers
  const [expandedGroups, setExpandedGroups] = useState({}); // Groupes expandés

  const typesActions = [
    { label: 'Sélectionner un type...', value: '' },
    { label: 'Crime', value: 'Crime' },
    { label: 'Détournement', value: 'Détournement' },
    { label: 'Adultère', value: 'Adultère' },
    { label: 'Mauvaise action', value: 'Mauvaise action' },
    { label: 'Propriété intellectuelle', value: 'Propriété intellectuelle' },
    { label: 'Mauvaise fois', value: 'Mauvaise fois' }
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
        case 'Propriété intellectuelle':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Bureau des brevets', value: 'Bureau des brevets' },
          { label: 'Ton voisin', value: 'Ton voisin' }
        ];
         case 'Mauvaise fois':
        return [
          { label: 'Sélectionner une autorité...', value: '' },
          { label: 'Tes potes', value: 'Tes potes' },
          { label: 'D la réponse D', value: 'D la réponse D' }
        ];
      default:
        return [{ label: 'Sélectionner d\'abord un type...', value: '' }];
    }
  };

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    const checkAuthState = async () => {
      try {
        console.log('Vérification de la session existante...');
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Session trouvée pour:', currentUser.email);
          setUser(currentUser);
        } else {
          console.log('Aucune session active');
        }
      } catch (error) {
        console.log('Erreur vérification auth:', error);
        setUser(null);
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
    // Charger les balançages et utilisateurs quand on passe au dashboard ou dossiers
    if (currentTab === 'dashboard' || currentTab === 'dossiers') {
      loadBalancages();
      loadUsers();
    }
  }, [currentTab]);

  // Fonction utilitaire pour obtenir le nom de l'utilisateur
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.nom || user.email?.split('@')[0] || '';
  };

  useEffect(() => {
    // Charger les balançages et utilisateurs dès que l'utilisateur se connecte
    if (user) {
      loadBalancages();
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    // Pré-remplir le nom du balanceur avec les infos de l'utilisateur connecté
    if (user && !nomBalanceur.trim()) {
      const nomUtilisateur = getUserDisplayName();
      setNomBalanceur(nomUtilisateur);
    }
  }, [user, currentTab]);

  const loadBalancages = async () => {
    try {
      if (useSupabase) {
        // Charger depuis Supabase - TOUS les balançages (mode public)
        console.log('Chargement de TOUS les balançages...');
        console.log('Utilisateur actuel:', user?.email);
        const data = await getAllBalancages();
        console.log(`${data?.length || 0} balançages récupérés`);
        
        // Debug: afficher les auteurs des balançages
        if (data && data.length > 0) {
          const auteurs = data.map(b => b.nom_balanceur).filter((v, i, a) => a.indexOf(v) === i);
          console.log('Auteurs des balançages:', auteurs);
        }
        
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

  // Charger la liste des utilisateurs
  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setUsersList(users);
    } catch (error) {
      console.log('Erreur lors du chargement des utilisateurs:', error);
      setUsersList([]);
    }
  };

  // Calculer les statistiques par type de crime
  const getStatsParType = () => {
    const stats = {};
    balancages.forEach(balancage => {
      const type = balancage.type_action;
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  // Calculer les statistiques par coupable (top 3)
  const getStatsParCoupable = () => {
    const stats = {};
    balancages.forEach(balancage => {
      const coupable = balancage.nom_pote;
      stats[coupable] = (stats[coupable] || 0) + 1;
    });
    
    // Retourner les 3 coupables avec le plus de balançages
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nom, count]) => ({ nom, count }));
  };

  // Calculer les statistiques par balanceur (top 3)
  const getStatsParBalanceur = () => {
    const stats = {};
    balancages.forEach(balancage => {
      const balanceur = balancage.nom_balanceur;
      stats[balanceur] = (stats[balanceur] || 0) + 1;
    });
    
    // Retourner les 3 balanceurs avec le plus d'activité
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nom, count]) => ({ nom, count }));
  };

  // Grouper les balançages par suspect
  const getBalancagesParSuspect = () => {
    const groups = {};
    balancages.forEach(balancage => {
      const suspect = balancage.nom_pote;
      if (!groups[suspect]) {
        groups[suspect] = [];
      }
      groups[suspect].push(balancage);
    });
    
    // Trier par nombre de dossiers (décroissant)
    return Object.entries(groups)
      .sort(([,a], [,b]) => b.length - a.length)
      .map(([nom, dossiers]) => ({
        nom,
        count: dossiers.length,
        dossiers: dossiers.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
      }));
  };

  // Grouper les balançages par balanceur
  const getBalancagesParBalanceur = () => {
    const groups = {};
    balancages.forEach(balancage => {
      const balanceur = balancage.nom_balanceur;
      if (!groups[balanceur]) {
        groups[balanceur] = [];
      }
      groups[balanceur].push(balancage);
    });
    
    // Trier par nombre de dossiers (décroissant)
    return Object.entries(groups)
      .sort(([,a], [,b]) => b.length - a.length)
      .map(([nom, dossiers]) => ({
        nom,
        count: dossiers.length,
        dossiers: dossiers.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
      }));
  };

  // Gérer l'expansion/réduction des groupes
  const toggleExpanded = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
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
              setShowNewSuspectInput(false);
              // Ne pas vider le nom du balanceur, garder l'utilisateur connecté
              setNomBalanceur(getUserDisplayName());
              setTypeAction('');
              setAutorite('');
              setDescription('');
              // Recharger les balançages et utilisateurs si on est sur le dashboard ou dossiers
              if (currentTab === 'dashboard' || currentTab === 'dossiers') {
                loadBalancages();
              }
              // Recharger la liste des utilisateurs car on a peut-être ajouté un nouveau nom
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
        <View style={styles.cardTitleContainer}>
          <MaterialCommunityIcons name="folder-open" size={20} color="#D4AF37" />
          <Text style={styles.cardTitle}>DOSSIER #{item.id}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.date_creation)}</Text>
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

  // Composant pour les groupes expandables
  const renderExpandableGroup = (group, type) => {
    const groupKey = `${type}_${group.nom}`;
    const isExpanded = expandedGroups[groupKey];
    
    return (
      <View key={groupKey} style={styles.expandableGroup}>
        <TouchableOpacity 
          style={styles.expandableHeader}
          onPress={() => toggleExpanded(groupKey)}
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
                {renderBalancageCard({ item: dossier })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderBalancerScreen = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="target" size={28} color="#D4AF37" />
          <Text style={styles.title}>BALANCE TON POTE</Text>
          <MaterialCommunityIcons name="target" size={28} color="#D4AF37" />
        </View>
        <Text style={styles.subtitle}>TRIBUNAL DE L'INQUISITION MODERNE</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOM DU SUSPECT :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={showNewSuspectInput ? 'AUTRE' : nomPote}
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={(value) => {
                if (value === 'AUTRE') {
                  setShowNewSuspectInput(true);
                  setNomPote('');
                } else {
                  setShowNewSuspectInput(false);
                  setNomPote(value);
                }
              }}
              dropdownIconColor="#D4AF37"
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              <Picker.Item 
                label="Sélectionner un suspect..." 
                value="" 
                color="#BBBBBB"
                style={{ backgroundColor: '#2A2A2A' }}
              />
              {usersList.map((user, index) => (
                <Picker.Item 
                  key={index} 
                  label={user} 
                  value={user}
                  color="#FFFFFF"
                  style={{ backgroundColor: '#2A2A2A' }}
                />
              ))}
              <Picker.Item 
                label="➕ Nouveau suspect..." 
                value="AUTRE" 
                color="#D4AF37"
                style={{ backgroundColor: '#2A2A2A' }}
              />
            </Picker>
          </View>
          {showNewSuspectInput && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={nomPote}
              onChangeText={setNomPote}
              placeholder="Saisir le nom du nouveau suspect..."
              placeholderTextColor="#666"
              autoFocus
            />
          )}
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
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={setTypeAction}
              dropdownIconColor="#D4AF37"
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              {typesActions.map((type, index) => (
                <Picker.Item 
                  key={index} 
                  label={type.label} 
                  value={type.value}
                  color={type.value === '' ? '#BBBBBB' : '#FFFFFF'}
                  style={{ backgroundColor: '#2A2A2A' }}
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
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={setAutorite}
              dropdownIconColor="#D4AF37"
              enabled={typeAction !== ''}
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              {getAutorites().map((auth, index) => (
                <Picker.Item 
                  key={index} 
                  label={auth.label} 
                  value={auth.value}
                  color={auth.value === '' ? '#BBBBBB' : '#FFFFFF'}
                  style={{ backgroundColor: '#2A2A2A' }}
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
        <View style={styles.titleContainer}>
          <MaterialIcons name="analytics" size={28} color="#D4AF37" />
          <Text style={styles.title}>DASHBOARD D'ENQUÊTE</Text>
          <MaterialIcons name="analytics" size={28} color="#D4AF37" />
        </View>
        <Text style={styles.subtitle}>STATISTIQUES DU TRIBUNAL</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 TOTAL DES DOSSIERS : {balancages.length}
        </Text>
        
        {balancages.length > 0 ? (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🏷️ CRIMES PAR TYPE</Text>
              {Object.entries(getStatsParType()).map(([type, count]) => {
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
              {getStatsParCoupable().map((coupable, index) => {
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
              {getStatsParBalanceur().map((balanceur, index) => {
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📊</Text>
            <Text style={styles.emptyStateTitle}>AUCUNE STATISTIQUE</Text>
            <Text style={styles.emptyStateSubtitle}>
              Les statistiques apparaîtront quand des dossiers seront créés
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderDossiersScreen = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="folder-open" size={28} color="#D4AF37" />
          <Text style={styles.title}>DOSSIERS D'ENQUÊTE</Text>
          <MaterialCommunityIcons name="folder-open" size={28} color="#D4AF37" />
        </View>
        <Text style={styles.subtitle}>ARCHIVES DES BALANÇAGES</Text>
      </View>

      {/* Onglets des dossiers */}
      <View style={styles.dossiersTabsContainer}>
        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === 'tous' && styles.dossiersTabActive]}
          onPress={() => setDossiersTab('tous')}
        >
          <MaterialCommunityIcons 
            name="folder-multiple" 
            size={20} 
            color={dossiersTab === 'tous' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === 'tous' && styles.dossiersTabTextActive]}>
            TOUS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === 'suspect' && styles.dossiersTabActive]}
          onPress={() => setDossiersTab('suspect')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={dossiersTab === 'suspect' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === 'suspect' && styles.dossiersTabTextActive]}>
            PAR SUSPECT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dossiersTab, dossiersTab === 'balance' && styles.dossiersTabActive]}
          onPress={() => setDossiersTab('balance')}
        >
          <MaterialIcons 
            name="report" 
            size={20} 
            color={dossiersTab === 'balance' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.dossiersTabText, dossiersTab === 'balance' && styles.dossiersTabTextActive]}>
            PAR BALANCE
          </Text>
        </TouchableOpacity>
      </View>

      {balancages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🎯</Text>
          <Text style={styles.emptyStateTitle}>AUCUN DOSSIER</Text>
          <Text style={styles.emptyStateSubtitle}>
            Commencez par dénoncer un suspect dans l'onglet "Balancer"
          </Text>
        </View>
      ) : (
        <View style={styles.dossiersContent}>
          {dossiersTab === 'tous' ? (
            <FlatList
              data={balancages}
              renderItem={renderBalancageCard}
              keyExtractor={(item) => item.id.toString()}
              style={styles.cardList}
              showsVerticalScrollIndicator={false}
            />
          ) : dossiersTab === 'suspect' ? (
            <ScrollView style={styles.expandableList} showsVerticalScrollIndicator={false}>
              {getBalancagesParSuspect().map((group) => renderExpandableGroup(group, 'suspect'))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.expandableList} showsVerticalScrollIndicator={false}>
              {getBalancagesParBalanceur().map((group) => renderExpandableGroup(group, 'balance'))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="settings-sharp" size={28} color="#D4AF37" />
          <Text style={styles.title}>PARAMÈTRES</Text>
          <Ionicons name="settings-sharp" size={28} color="#D4AF37" />
        </View>
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
         currentTab === 'dossiers' ? renderDossiersScreen() :
         currentTab === 'settings' ? renderSettingsScreen() : 
         renderDashboardScreen()}
      </View>

      {/* Menu de navigation en bas */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navTab, currentTab === 'dashboard' && styles.navTabActive]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <MaterialIcons 
            name="analytics" 
            size={24} 
            color={currentTab === 'dashboard' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === 'dashboard' && styles.navLabelActive]}>DASHBOARD</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === 'dossiers' && styles.navTabActive]}
          onPress={() => setCurrentTab('dossiers')}
        >
          <MaterialCommunityIcons 
            name="folder-open" 
            size={24} 
            color={currentTab === 'dossiers' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === 'dossiers' && styles.navLabelActive]}>DOSSIERS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === 'balancer' && styles.navTabActive]}
          onPress={() => setCurrentTab('balancer')}
        >
          <MaterialCommunityIcons 
            name="target" 
            size={24} 
            color={currentTab === 'balancer' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === 'balancer' && styles.navLabelActive]}>BALANCER</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, currentTab === 'settings' && styles.navTabActive]}
          onPress={() => setCurrentTab('settings')}
        >
          <Ionicons 
            name="settings-sharp" 
            size={24} 
            color={currentTab === 'settings' ? '#D4AF37' : '#666'} 
          />
          <Text style={[styles.navLabel, currentTab === 'settings' && styles.navLabelActive]}>SETTINGS</Text>
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
    paddingTop: 40, // Espace augmenté pour éviter les icônes Android
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
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
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    ...Platform.select({
      android: {
        backgroundColor: '#2A2A2A',
        color: '#FFFFFF',
        fontFamily: 'System',
      },
    }),
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
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
  navTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  navTabActive: {
    borderBottomColor: '#D4AF37',
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginTop: -2,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#8B0000',
  },
  navIconActive: {
    color: '#D4AF37',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  navLabel: {
    color: '#8B0000',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  navLabelActive: {
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
    alignItems: 'stretch',
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
  statsSection: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  statsSectionTitle: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  statsLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
  },
  statsValue: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 70,
    textAlign: 'right',
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
  logo: {
    width: 250,
    height: 150,
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#8B0000',
    padding: 6,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    color: '#FFFFFF',
    fontSize: 10,
    fontStyle: 'italic',
  },
  cardBody: {
    padding: 8,
  },
  infoGrid: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoCell: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  infoLabel: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  descriptionSection: {
    marginTop: 2,
  },
  descriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  descriptionTitle: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  descriptionBox: {
    backgroundColor: '#2A2A2A',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#8B0000',
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  crimeType: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  cardFooter: {
    backgroundColor: '#2A2A2A',
    padding: 8,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    alignItems: 'center',
  },
  cardStatus: {
    color: '#4CAF50',
    fontSize: 10,
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
  logoutDescription: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  // Styles pour les onglets des dossiers
  dossiersTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    margin: 10,
    marginTop: 0,
    overflow: 'hidden',
  },
  dossiersTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderRightWidth: 1,
    borderRightColor: '#8B0000',
    gap: 6,
  },
  dossiersTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  dossiersTabText: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dossiersTabTextActive: {
    color: '#D4AF37',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  dossiersContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  // Styles pour les groupes expandables
  expandableList: {
    flex: 1,
  },
  expandableGroup: {
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: '#8B0000',
  },
  expandableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  expandableHeaderText: {
    flex: 1,
  },
  expandableTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  expandableSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 2,
  },
  expandableBadge: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  expandableBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandableContent: {
    backgroundColor: '#0A0A0A',
    padding: 8,
  },
  expandableCard: {
    marginBottom: 8,
  },
});

