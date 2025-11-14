import { getUserDisplayName } from '../userUtils';

describe('userUtils', () => {
  describe('getUserDisplayName', () => {
    it('should return empty string if user is null', () => {
      const result = getUserDisplayName(null);
      expect(result).toBe('');
    });

    it('should return empty string if user is undefined', () => {
      const result = getUserDisplayName(undefined);
      expect(result).toBe('');
    });

    it('should return user metadata name if available', () => {
      const user = {
        email: 'test@example.com',
        user_metadata: {
          nom: 'Jean Dupont'
        }
      };
      
      const result = getUserDisplayName(user);
      expect(result).toBe('Jean Dupont');
    });

    it('should return email username if no metadata name', () => {
      const user = {
        email: 'john.doe@example.com',
        user_metadata: {}
      };
      
      const result = getUserDisplayName(user);
      expect(result).toBe('john.doe');
    });

    it('should handle missing user_metadata', () => {
      const user = {
        email: 'test@example.com'
      };
      
      const result = getUserDisplayName(user);
      expect(result).toBe('test');
    });

    it('should prioritize metadata name over email', () => {
      const user = {
        email: 'test@example.com',
        user_metadata: {
          nom: 'Pierre'
        }
      };
      
      const result = getUserDisplayName(user);
      expect(result).toBe('Pierre');
      expect(result).not.toBe('test');
    });

    it('should handle user with no email', () => {
      const user = {
        user_metadata: {}
      };
      
      const result = getUserDisplayName(user);
      expect(result).toBe('');
    });
  });
});
