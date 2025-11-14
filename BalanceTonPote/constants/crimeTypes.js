/**
 * Types d'actions disponibles dans l'application
 */
export const TYPES_ACTIONS = [
  { label: 'Sélectionner un type...', value: '' },
  { label: 'Crime', value: 'Crime' },
  { label: 'Détournement', value: 'Détournement' },
  { label: 'Adultère', value: 'Adultère' },
  { label: 'Mauvaise action', value: 'Mauvaise action' },
  { label: 'Propriété intellectuelle', value: 'Propriété intellectuelle' },
  { label: 'Mauvaise fois', value: 'Mauvaise fois' }
];

/**
 * Retourne les autorités compétentes selon le type d'action
 * @param {string} typeAction - Type d'action sélectionné
 * @returns {Array} Liste des autorités disponibles
 */
export const getAutorites = (typeAction) => {
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
