/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date au format français
 * @param {string} dateString - La date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
