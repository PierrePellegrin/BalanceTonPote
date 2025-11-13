import { createClient } from '@supabase/supabase-js';

// Ces valeurs seront à remplacer par vos vraies clés Supabase
const SUPABASE_URL = 'https://votre-projet.supabase.co'; // À remplacer
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // À remplacer

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