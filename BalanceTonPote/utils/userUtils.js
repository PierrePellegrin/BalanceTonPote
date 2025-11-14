/**
 * Utilitaires pour la gestion des utilisateurs
 */

/**
 * Obtient le nom d'affichage de l'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} Nom d'affichage
 */
export const getUserDisplayName = (user) => {
  if (!user) return '';
  return user.user_metadata?.nom || user.email?.split('@')[0] || '';
};
