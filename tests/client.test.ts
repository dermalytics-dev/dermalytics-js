/** Tests for the Dermalytics client */

import { Dermalytics } from '../src/client';

describe('Dermalytics', () => {
  it('should initialize without error', () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(Dermalytics);
  });

  it('should throw error when calling getIngredient', async () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.getIngredient('niacinamide')).rejects.toThrow(
      'This SDK is a placeholder'
    );
  });

  it('should throw error when calling analyze', async () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(
      client.analyze(['Aqua', 'Glycerin'])
    ).rejects.toThrow('This SDK is a placeholder');
  });
});
