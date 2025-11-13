import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANT: Remplacez ces valeurs par vos vraies clés Supabase
// Exemple: const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_URL = 'https://olycfliunmrpjumwtpux.supabase.co'; // À remplacer
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seWNmbGl1bm1ycGp1bXd0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjQ0MjcsImV4cCI6MjA3ODYwMDQyN30.53TaDkbBNtlO-mK7gjDd9X34ceSRBDmFBIrfGHnF9dY'; // À remplacer

// 🔧 Pour obtenir ces valeurs :
// 1. Allez sur https://supabase.com
// 2. Créez un projet (gratuit)
// 3. Allez dans Settings > API
// 4. Copiez "Project URL" et "anon public" key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const { data, error } = await supabase
    .from('balancages')
    .select('*')
    .order('date_creation', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
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
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};