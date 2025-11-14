import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { 
  initializeDatabase, 
  insertBalancage, 
  getAllBalancages, 
  getAllUsers,
  getCurrentUser,
  onAuthStateChange
} from '../lib/supabase';

/**
 * Hook personnalisé pour gérer l'authentification
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
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

  return { user, authLoading, setUser };
};

/**
 * Hook personnalisé pour gérer la base de données
 */
export const useDatabase = () => {
  const [useSupabase, setUseSupabase] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        console.log('Supabase initialisé avec succès - Base partagée disponible');
        setUseSupabase(true);
        setConnectionStatus('online');
      } catch (error) {
        console.log('Erreur Supabase, fallback vers SQLite local:', error);
        setUseSupabase(false);
        setConnectionStatus('offline');
        
        try {
          const database = await SQLite.openDatabaseAsync('balanceTonPote.db');
          await database.execAsync(`
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
          setDb(database);
          console.log('Base de données SQLite initialisée avec succès (mode offline)');
        } catch (sqliteError) {
          console.log('Erreur lors de l\'initialisation SQLite:', sqliteError);
        }
      }
    };
    
    initDb();
  }, []);

  return { db, useSupabase, connectionStatus };
};

/**
 * Hook personnalisé pour gérer les balançages
 */
export const useBalancages = (db, useSupabase, user) => {
  const [balancages, setBalancages] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const loadBalancages = async () => {
    try {
      if (useSupabase) {
        console.log('Chargement de TOUS les balançages...');
        console.log('Utilisateur actuel:', user?.email);
        const data = await getAllBalancages();
        console.log(`${data?.length || 0} balançages récupérés`);
        
        if (data && data.length > 0) {
          const auteurs = data.map(b => b.nom_balanceur).filter((v, i, a) => a.indexOf(v) === i);
          console.log('Auteurs des balançages:', auteurs);
        }
        
        setBalancages(data || []);
      } else {
        if (!db) return;
        const result = await db.getAllAsync('SELECT * FROM balancages ORDER BY date_creation DESC');
        setBalancages(result || []);
      }
    } catch (error) {
      console.log('Erreur lors du chargement des balançages:', error);
      setBalancages([]);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setUsersList(users);
    } catch (error) {
      console.log('Erreur lors du chargement des utilisateurs:', error);
      setUsersList([]);
    }
  };

  const saveBalancage = async (balancageData) => {
    try {
      if (useSupabase) {
        await insertBalancage(balancageData);
      } else {
        if (!db) {
          throw new Error('Base de données non initialisée');
        }
        await db.runAsync(
          'INSERT INTO balancages (nom_pote, nom_balanceur, type_action, autorite, description) VALUES (?, ?, ?, ?, ?)',
          [balancageData.nom_pote, balancageData.nom_balanceur, balancageData.type_action, balancageData.autorite, balancageData.description]
        );
      }
      return true;
    } catch (error) {
      console.log('Erreur saveBalancage:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadBalancages();
      loadUsers();
    }
  }, [user]);

  return { balancages, usersList, loadBalancages, loadUsers, saveBalancage };
};
