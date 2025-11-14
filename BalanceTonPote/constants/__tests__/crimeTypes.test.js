import { TYPES_ACTIONS, getAutorites } from '../crimeTypes';

describe('crimeTypes', () => {
  describe('TYPES_ACTIONS', () => {
    it('should have correct structure', () => {
      expect(Array.isArray(TYPES_ACTIONS)).toBe(true);
      expect(TYPES_ACTIONS.length).toBeGreaterThan(0);
    });

    it('should include placeholder option', () => {
      const placeholder = TYPES_ACTIONS[0];
      expect(placeholder.value).toBe('');
      expect(placeholder.label).toContain('Sélectionner');
    });

    it('should include all crime types', () => {
      const types = TYPES_ACTIONS.map(t => t.value);
      
      expect(types).toContain('Crime');
      expect(types).toContain('Détournement');
      expect(types).toContain('Adultère');
      expect(types).toContain('Mauvaise action');
      expect(types).toContain('Propriété intellectuelle');
      expect(types).toContain('Mauvaise fois');
    });

    it('should have label and value for each type', () => {
      TYPES_ACTIONS.forEach(type => {
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('value');
        expect(typeof type.label).toBe('string');
        expect(typeof type.value).toBe('string');
      });
    });
  });

  describe('getAutorites', () => {
    it('should return placeholder for empty or invalid type', () => {
      const result = getAutorites('');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('');
    });

    it('should return default message for unknown type', () => {
      const result = getAutorites('TypeInconnu');
      
      expect(result.length).toBe(1);
      expect(result[0].label).toContain('Sélectionner d\'abord un type');
    });

    it('should return authorities for Crime', () => {
      const result = getAutorites('Crime');
      
      expect(result.length).toBeGreaterThan(1);
      expect(result.some(a => a.value === 'Police')).toBe(true);
      expect(result.some(a => a.value === 'FBI')).toBe(true);
      expect(result.some(a => a.value === 'CIA')).toBe(true);
      expect(result.some(a => a.value === 'GIGN')).toBe(true);
    });

    it('should return authorities for Détournement', () => {
      const result = getAutorites('Détournement');
      
      expect(result.some(a => a.value === 'Impôts')).toBe(true);
      expect(result.some(a => a.value === 'URSSAF')).toBe(true);
      expect(result.some(a => a.value === 'CAF')).toBe(true);
    });

    it('should return authorities for Adultère', () => {
      const result = getAutorites('Adultère');
      
      expect(result.some(a => a.value === 'Femme')).toBe(true);
      expect(result.some(a => a.value === 'Conjointe')).toBe(true);
      expect(result.some(a => a.value === 'Belle mère')).toBe(true);
    });

    it('should return authorities for Mauvaise action', () => {
      const result = getAutorites('Mauvaise action');
      
      expect(result.some(a => a.value === 'Père Noël')).toBe(true);
      expect(result.some(a => a.value === 'Lapin de Pâques')).toBe(true);
    });

    it('should return authorities for Propriété intellectuelle', () => {
      const result = getAutorites('Propriété intellectuelle');
      
      expect(result.some(a => a.value === 'Bureau des brevets')).toBe(true);
      expect(result.some(a => a.value === 'Ton voisin')).toBe(true);
    });

    it('should return authorities for Mauvaise fois', () => {
      const result = getAutorites('Mauvaise fois');
      
      expect(result.some(a => a.value === 'Tes potes')).toBe(true);
      expect(result.some(a => a.value === 'D la réponse D')).toBe(true);
    });

    it('should always include placeholder in results', () => {
      const types = ['Crime', 'Détournement', 'Adultère', 'Mauvaise action'];
      
      types.forEach(type => {
        const result = getAutorites(type);
        expect(result[0].value).toBe('');
        expect(result[0].label).toContain('Sélectionner');
      });
    });

    it('should return array with label and value structure', () => {
      const result = getAutorites('Crime');
      
      result.forEach(autorite => {
        expect(autorite).toHaveProperty('label');
        expect(autorite).toHaveProperty('value');
        expect(typeof autorite.label).toBe('string');
        expect(typeof autorite.value).toBe('string');
      });
    });
  });
});
