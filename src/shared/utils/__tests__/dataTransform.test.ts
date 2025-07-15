import { transformIdField, transformIdFields, handleApiResponse } from '../dataTransform';

describe('dataTransform', () => {
  describe('transformIdField', () => {
    it('should transform _id to id', () => {
      const input = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Provider',
        slug: 'test-provider'
      };

      const result = transformIdField(input);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.name).toBe('Test Provider');
      expect(result.slug).toBe('test-provider');
    });

    it('should keep existing id if no _id present', () => {
      const input = {
        id: 'existing-id',
        name: 'Test Provider',
        slug: 'test-provider'
      };

      const result = transformIdField(input);

      expect(result.id).toBe('existing-id');
      expect(result.name).toBe('Test Provider');
      expect(result.slug).toBe('test-provider');
    });

    it('should prefer _id over existing id', () => {
      const input = {
        _id: '507f1f77bcf86cd799439011',
        id: 'existing-id',
        name: 'Test Provider',
        slug: 'test-provider'
      };

      const result = transformIdField(input);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.name).toBe('Test Provider');
      expect(result.slug).toBe('test-provider');
    });

    it('should handle null/undefined input', () => {
      expect(transformIdField(null as any)).toBe(null);
      expect(transformIdField(undefined as any)).toBe(undefined);
    });
  });

  describe('transformIdFields', () => {
    it('should transform array of objects', () => {
      const input = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Provider 1',
          slug: 'provider-1'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Provider 2',
          slug: 'provider-2'
        }
      ];

      const result = transformIdFields(input);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[1].id).toBe('507f1f77bcf86cd799439012');
    });

    it('should handle empty array', () => {
      const result = transformIdFields([]);
      expect(result).toEqual([]);
    });

    it('should handle non-array input', () => {
      const input = { _id: '507f1f77bcf86cd799439011', name: 'Test' };
      const result = transformIdFields(input as any);
      expect(result).toBe(input);
    });
  });

  describe('handleApiResponse', () => {
    it('should handle wrapped response format for array', () => {
      const response = {
        data: {
          success: true,
          data: [
            {
              _id: '507f1f77bcf86cd799439011',
              name: 'Provider 1',
              slug: 'provider-1'
            }
          ]
        }
      };

      const result = handleApiResponse(response, true);

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[])[0].id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle wrapped response format for single object', () => {
      const response = {
        data: {
          success: true,
          data: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Provider 1',
            slug: 'provider-1'
          }
        }
      };

      const result = handleApiResponse(response, false);

      expect((result as any).id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle direct response format for array', () => {
      const response = {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Provider 1',
            slug: 'provider-1'
          }
        ]
      };

      const result = handleApiResponse(response, true);

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[])[0].id).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle error response', () => {
      const response = {
        data: {
          success: false,
          message: 'Not found'
        }
      };

      expect(() => handleApiResponse(response, true)).toThrow('Not found');
    });

    it('should handle null data in array context', () => {
      const response = {
        data: {
          success: true,
          data: null
        }
      };

      const result = handleApiResponse(response, true);
      expect(result).toEqual([]);
    });
  });
});