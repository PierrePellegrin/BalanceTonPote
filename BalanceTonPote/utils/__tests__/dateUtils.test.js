import { formatDate } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a valid date string to French locale', () => {
      const dateString = '2025-11-14T10:30:00.000Z';
      const result = formatDate(dateString);
      
      // Vérifier que le résultat contient "à" (format français)
      expect(result).toContain('à');
      
      // Vérifier que le résultat contient des chiffres (date et heure)
      expect(result).toMatch(/\d+/);
    });

    it('should format current date correctly', () => {
      const now = new Date();
      const result = formatDate(now.toISOString());
      
      expect(result).toContain('à');
      expect(result).toBeTruthy();
    });

    it('should handle ISO date strings', () => {
      const isoDate = '2025-01-15T14:25:00.000Z';
      const result = formatDate(isoDate);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format time in HH:MM format', () => {
      const dateString = '2025-11-14T15:30:00.000Z';
      const result = formatDate(dateString);
      
      // Le résultat devrait contenir l'heure au format HH:MM
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
});
