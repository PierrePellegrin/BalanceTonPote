import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Remplacez ces valeurs par vos vraies clés Supabase
// Exemple: const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_URL = 'https://olycfliunmrpjumwtpux.supabase.co'; // À remplacer
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seWNmbGl1bm1ycGp1bXd0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQ0MjcsImV4cCI6MjA3ODYwMDQyN30.53TaDkbBNtlO-mK7gjDd9X34ceSRBDmFBIrfGHnF9dY'; // À remplacer

// 🔧 Pour obtenir ces valeurs :
// 1. Allez sur https://supabase.com
// 2. Créez un projet (gratuit)
// 3. Allez dans Settings > API
// 4. Copiez "Project URL" et "anon public" key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Fonction pour créer la table si elle n'existe pas
export const initializeDatabase = async () => {
  try {
    // Vérifier si la table existe en essayent de la lire
    const { data, error } = await supabase
      .from('balancages')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table n'existe pas, elle sera créée via l'interface Supabase
      console.log('Table balancages doit être créée dans Supabase');
      return false;
    }
    
    console.log('Base de données Supabase initialisée avec succès');
    return true;
  } catch (error) {
    console.log('Erreur lors de l\'initialisation Supabase:', error);
    return false;
  }
};

// Fonctions pour interagir avec la base de données
export const insertBalancage = async (balancage) => {
  const { data, error } = await supabase
    .from('balancages')
    .insert([
      {
        nom_pote: balancage.nom_pote,
        nom_balanceur: balancage.nom_balanceur,
        type_action: balancage.type_action,
        autorite: balancage.autorite,
        description: balancage.description,
        user_id: balancage.user_id,
        date_creation: new Date().toISOString()
      }
    ]);

  if (error) {
    throw error;
  }
  
  return data;
};

export const getAllBalancages = async () => {
  try {
    // Essayons d'abord avec RPC si disponible, sinon fallback
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_balancages_public');
      
      if (!rpcError && rpcData) {
        console.log('Données récupérées depuis Supabase (RPC):', rpcData?.length || 0, 'enregistrements');
        return rpcData;
      }
    } catch (rpcError) {
      console.log('RPC non disponible, utilisation de la méthode standard');
    }

    // Méthode standard - essai avec une requête simple
    const { data, error } = await supabase
      .from('balancages')
      .select(`
        id,
        nom_pote,
        nom_balanceur,
        type_action,
        autorite,
        description,
        date_creation,
        user_id
      `)
      .order('date_creation', { ascending: false });

    if (error) {
      console.log('Erreur getAllBalancages:', error);
      throw error;
    }

    console.log('Données récupérées depuis Supabase:', data?.length || 0, 'enregistrements');
    return data;
  } catch (error) {
    console.log('Erreur dans getAllBalancages:', error);
    throw error;
  }
};

export const getBalancagesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('balancages')
    .select('*')
    .eq('user_id', userId)
    .order('date_creation', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Mettre à jour un balançage (uniquement si user_id correspond)
export const updateBalancage = async (id, updates, userId) => {
  // Vérifier d'abord que le balançage appartient à l'utilisateur
  const { data: existing, error: checkError } = await supabase
    .from('balancages')
    .select('user_id')
    .eq('id', id)
    .single();

  if (checkError) {
    throw checkError;
  }

  if (existing.user_id !== userId) {
    throw new Error('Vous ne pouvez modifier que vos propres dossiers');
  }

  // Effectuer la mise à jour
  const { data, error } = await supabase
    .from('balancages')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data;
};

// Supprimer un balançage (uniquement si user_id correspond)
export const deleteBalancage = async (id, userId) => {
  // Vérifier d'abord que le balançage appartient à l'utilisateur
  const { data: existing, error: checkError } = await supabase
    .from('balancages')
    .select('user_id')
    .eq('id', id)
    .single();

  if (checkError) {
    throw checkError;
  }

  if (existing.user_id !== userId) {
    throw new Error('Vous ne pouvez supprimer que vos propres dossiers');
  }

  // Effectuer la suppression
  const { data, error } = await supabase
    .from('balancages')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data;
};

// 🔐 Fonctions d'authentification
export const signUp = async (email, password, nom) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom: nom,
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // Vérifier d'abord la session locale
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log('Session locale trouvée:', session.user.email);
      return session.user;
    }
    
    // Si pas de session locale, essayer de récupérer l'utilisateur
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.log('Erreur dans getCurrentUser:', error);
    return null;
  }
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Fonction pour récupérer tous les utilisateurs distincts depuis les balançages
export const getAllUsers = async () => {
  try {
    // Récupérer tous les noms de balanceurs uniques
    const { data: balanceurs, error: errorBalanceurs } = await supabase
      .from('balancages')
      .select('nom_balanceur')
      .not('nom_balanceur', 'is', null);

    // Récupérer tous les noms de suspects uniques
    const { data: suspects, error: errorSuspects } = await supabase
      .from('balancages')
      .select('nom_pote')
      .not('nom_pote', 'is', null);

    if (errorBalanceurs || errorSuspects) {
      throw errorBalanceurs || errorSuspects;
    }

    // Combiner et dédupliquer les noms
    const allNames = new Set();
    
    balanceurs?.forEach(item => {
      if (item.nom_balanceur && item.nom_balanceur.trim()) {
        allNames.add(item.nom_balanceur.trim());
      }
    });
    
    suspects?.forEach(item => {
      if (item.nom_pote && item.nom_pote.trim()) {
        allNames.add(item.nom_pote.trim());
      }
    });

    return Array.from(allNames).sort();
  } catch (error) {
    console.log('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};