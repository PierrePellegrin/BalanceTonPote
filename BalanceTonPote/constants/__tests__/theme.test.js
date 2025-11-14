import { COLORS, TABS, DOSSIERS_TABS } from '../theme';

describe('theme constants', () => {
  describe('COLORS', () => {
    it('should have background colors defined', () => {
      expect(COLORS).toHaveProperty('background');
      expect(COLORS.background).toHaveProperty('primary');
      expect(COLORS.background).toHaveProperty('secondary');
      expect(COLORS.background).toHaveProperty('tertiary');
    });

    it('should have text colors defined', () => {
      expect(COLORS).toHaveProperty('text');
      expect(COLORS.text).toHaveProperty('primary');
      expect(COLORS.text).toHaveProperty('secondary');
      expect(COLORS.text).toHaveProperty('placeholder');
      expect(COLORS.text).toHaveProperty('placeholderLight');
    });

    it('should have accent colors defined', () => {
      expect(COLORS).toHaveProperty('accent');
      expect(COLORS.accent).toHaveProperty('gold');
      expect(COLORS.accent).toHaveProperty('red');
      expect(COLORS.accent).toHaveProperty('redLight');
      expect(COLORS.accent).toHaveProperty('green');
    });

    it('should use valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      
      expect(COLORS.background.primary).toMatch(hexColorRegex);
      expect(COLORS.text.primary).toMatch(hexColorRegex);
      expect(COLORS.accent.gold).toMatch(hexColorRegex);
    });

    it('should have dark theme colors', () => {
      // Vérifier que les backgrounds sont sombres (commencent par #0 ou #1)
      expect(COLORS.background.primary).toMatch(/^#[0-1]/);
      expect(COLORS.background.secondary).toMatch(/^#[0-1]/);
    });
  });

  describe('TABS', () => {
    it('should have all main navigation tabs', () => {
      expect(TABS).toHaveProperty('DASHBOARD');
      expect(TABS).toHaveProperty('DOSSIERS');
      expect(TABS).toHaveProperty('BALANCER');
      expect(TABS).toHaveProperty('SETTINGS');
    });

    it('should have string values', () => {
      expect(typeof TABS.DASHBOARD).toBe('string');
      expect(typeof TABS.DOSSIERS).toBe('string');
      expect(typeof TABS.BALANCER).toBe('string');
      expect(typeof TABS.SETTINGS).toBe('string');
    });

    it('should have unique values', () => {
      const values = Object.values(TABS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have lowercase values', () => {
      Object.values(TABS).forEach(tab => {
        expect(tab).toBe(tab.toLowerCase());
      });
    });
  });

  describe('DOSSIERS_TABS', () => {
    it('should have all dossiers sub-tabs', () => {
      expect(DOSSIERS_TABS).toHaveProperty('TOUS');
      expect(DOSSIERS_TABS).toHaveProperty('SUSPECT');
      expect(DOSSIERS_TABS).toHaveProperty('BALANCE');
    });

    it('should have string values', () => {
      expect(typeof DOSSIERS_TABS.TOUS).toBe('string');
      expect(typeof DOSSIERS_TABS.SUSPECT).toBe('string');
      expect(typeof DOSSIERS_TABS.BALANCE).toBe('string');
    });

    it('should have unique values', () => {
      const values = Object.values(DOSSIERS_TABS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have lowercase values', () => {
      Object.values(DOSSIERS_TABS).forEach(tab => {
        expect(tab).toBe(tab.toLowerCase());
      });
    });
  });

  describe('Theme consistency', () => {
    it('should use consistent gold color', () => {
      expect(COLORS.accent.gold).toBe('#D4AF37');
    });

    it('should use consistent red color', () => {
      expect(COLORS.accent.red).toBe('#8B0000');
    });

    it('should define primary background as darkest', () => {
      expect(COLORS.background.primary).toBe('#0A0A0A');
    });

    it('should have white as primary text color', () => {
      expect(COLORS.text.primary).toBe('#FFFFFF');
    });
  });
});
