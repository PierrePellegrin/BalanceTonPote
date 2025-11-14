/**
 * Utilitaires pour les statistiques
 */

/**
 * Calcule les statistiques par type de crime
 * @param {Array} balancages - Liste des balançages
 * @returns {Object} Statistiques par type
 */
export const getStatsParType = (balancages) => {
  const stats = {};
  balancages.forEach(balancage => {
    const type = balancage.type_action;
    stats[type] = (stats[type] || 0) + 1;
  });
  return stats;
};

/**
 * Calcule les statistiques par coupable (top 3)
 * @param {Array} balancages - Liste des balançages
 * @returns {Array} Top 3 des coupables
 */
export const getStatsParCoupable = (balancages) => {
  const stats = {};
  balancages.forEach(balancage => {
    const coupable = balancage.nom_pote;
    stats[coupable] = (stats[coupable] || 0) + 1;
  });
  
  return Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([nom, count]) => ({ nom, count }));
};

/**
 * Calcule les statistiques par balanceur (top 3)
 * @param {Array} balancages - Liste des balançages
 * @returns {Array} Top 3 des balanceurs
 */
export const getStatsParBalanceur = (balancages) => {
  const stats = {};
  balancages.forEach(balancage => {
    const balanceur = balancage.nom_balanceur;
    stats[balanceur] = (stats[balanceur] || 0) + 1;
  });
  
  return Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([nom, count]) => ({ nom, count }));
};

/**
 * Groupe les balançages par suspect
 * @param {Array} balancages - Liste des balançages
 * @returns {Array} Balançages groupés par suspect
 */
export const getBalancagesParSuspect = (balancages) => {
  const groups = {};
  balancages.forEach(balancage => {
    const suspect = balancage.nom_pote;
    if (!groups[suspect]) {
      groups[suspect] = [];
    }
    groups[suspect].push(balancage);
  });
  
  return Object.entries(groups)
    .sort(([,a], [,b]) => b.length - a.length)
    .map(([nom, dossiers]) => ({
      nom,
      count: dossiers.length,
      dossiers: dossiers.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
    }));
};

/**
 * Groupe les balançages par balanceur
 * @param {Array} balancages - Liste des balançages
 * @returns {Array} Balançages groupés par balanceur
 */
export const getBalancagesParBalanceur = (balancages) => {
  const groups = {};
  balancages.forEach(balancage => {
    const balanceur = balancage.nom_balanceur;
    if (!groups[balanceur]) {
      groups[balanceur] = [];
    }
    groups[balanceur].push(balancage);
  });
  
  return Object.entries(groups)
    .sort(([,a], [,b]) => b.length - a.length)
    .map(([nom, dossiers]) => ({
      nom,
      count: dossiers.length,
      dossiers: dossiers.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
    }));
};
