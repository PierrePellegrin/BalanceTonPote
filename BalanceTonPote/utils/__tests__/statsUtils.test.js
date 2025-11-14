import {
  getStatsParType,
  getStatsParCoupable,
  getStatsParBalanceur,
  getBalancagesParSuspect,
  getBalancagesParBalanceur
} from '../statsUtils';

describe('statsUtils', () => {
  const mockBalancages = [
    {
      id: 1,
      nom_pote: 'Alice',
      nom_balanceur: 'Bob',
      type_action: 'Crime',
      date_creation: '2025-11-14T10:00:00.000Z'
    },
    {
      id: 2,
      nom_pote: 'Alice',
      nom_balanceur: 'Charlie',
      type_action: 'Détournement',
      date_creation: '2025-11-14T11:00:00.000Z'
    },
    {
      id: 3,
      nom_pote: 'Bob',
      nom_balanceur: 'Alice',
      type_action: 'Crime',
      date_creation: '2025-11-14T12:00:00.000Z'
    },
    {
      id: 4,
      nom_pote: 'Charlie',
      nom_balanceur: 'Bob',
      type_action: 'Adultère',
      date_creation: '2025-11-14T13:00:00.000Z'
    }
  ];

  describe('getStatsParType', () => {
    it('should return empty object for empty array', () => {
      const result = getStatsParType([]);
      expect(result).toEqual({});
    });

    it('should count balancages by type', () => {
      const result = getStatsParType(mockBalancages);
      
      expect(result['Crime']).toBe(2);
      expect(result['Détournement']).toBe(1);
      expect(result['Adultère']).toBe(1);
    });

    it('should handle single balancage', () => {
      const result = getStatsParType([mockBalancages[0]]);
      
      expect(result['Crime']).toBe(1);
      expect(Object.keys(result).length).toBe(1);
    });
  });

  describe('getStatsParCoupable', () => {
    it('should return empty array for empty input', () => {
      const result = getStatsParCoupable([]);
      expect(result).toEqual([]);
    });

    it('should return top 3 coupables sorted by count', () => {
      const result = getStatsParCoupable(mockBalancages);
      
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result[0].nom).toBe('Alice');
      expect(result[0].count).toBe(2);
    });

    it('should limit results to 3 items', () => {
      const manyBalancages = [
        ...mockBalancages,
        { id: 5, nom_pote: 'David', type_action: 'Crime' },
        { id: 6, nom_pote: 'Eve', type_action: 'Crime' },
        { id: 7, nom_pote: 'Frank', type_action: 'Crime' }
      ];
      
      const result = getStatsParCoupable(manyBalancages);
      expect(result.length).toBe(3);
    });

    it('should sort by count in descending order', () => {
      const result = getStatsParCoupable(mockBalancages);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
      }
    });
  });

  describe('getStatsParBalanceur', () => {
    it('should return empty array for empty input', () => {
      const result = getStatsParBalanceur([]);
      expect(result).toEqual([]);
    });

    it('should return top 3 balanceurs sorted by count', () => {
      const result = getStatsParBalanceur(mockBalancages);
      
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result[0].nom).toBe('Bob');
      expect(result[0].count).toBe(2);
    });

    it('should include nom and count properties', () => {
      const result = getStatsParBalanceur(mockBalancages);
      
      result.forEach(balanceur => {
        expect(balanceur).toHaveProperty('nom');
        expect(balanceur).toHaveProperty('count');
        expect(typeof balanceur.nom).toBe('string');
        expect(typeof balanceur.count).toBe('number');
      });
    });
  });

  describe('getBalancagesParSuspect', () => {
    it('should return empty array for empty input', () => {
      const result = getBalancagesParSuspect([]);
      expect(result).toEqual([]);
    });

    it('should group balancages by suspect name', () => {
      const result = getBalancagesParSuspect(mockBalancages);
      
      expect(result.length).toBe(3); // Alice, Bob, Charlie
      
      const aliceGroup = result.find(g => g.nom === 'Alice');
      expect(aliceGroup.count).toBe(2);
      expect(aliceGroup.dossiers.length).toBe(2);
    });

    it('should sort groups by count descending', () => {
      const result = getBalancagesParSuspect(mockBalancages);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
      }
    });

    it('should sort dossiers by date descending within each group', () => {
      const result = getBalancagesParSuspect(mockBalancages);
      
      result.forEach(group => {
        for (let i = 1; i < group.dossiers.length; i++) {
          const prevDate = new Date(group.dossiers[i - 1].date_creation);
          const currDate = new Date(group.dossiers[i].date_creation);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      });
    });

    it('should include all required properties', () => {
      const result = getBalancagesParSuspect(mockBalancages);
      
      result.forEach(group => {
        expect(group).toHaveProperty('nom');
        expect(group).toHaveProperty('count');
        expect(group).toHaveProperty('dossiers');
        expect(Array.isArray(group.dossiers)).toBe(true);
      });
    });
  });

  describe('getBalancagesParBalanceur', () => {
    it('should return empty array for empty input', () => {
      const result = getBalancagesParBalanceur([]);
      expect(result).toEqual([]);
    });

    it('should group balancages by balanceur name', () => {
      const result = getBalancagesParBalanceur(mockBalancages);
      
      const bobGroup = result.find(g => g.nom === 'Bob');
      expect(bobGroup.count).toBe(2);
      expect(bobGroup.dossiers.length).toBe(2);
    });

    it('should maintain data integrity', () => {
      const result = getBalancagesParBalanceur(mockBalancages);
      
      result.forEach(group => {
        group.dossiers.forEach(dossier => {
          expect(dossier.nom_balanceur).toBe(group.nom);
        });
      });
    });
  });
});
