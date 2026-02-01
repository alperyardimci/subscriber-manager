import {SUBSCRIPTION_TEMPLATES} from '../src/features/subscriptions/data/templates';

describe('SUBSCRIPTION_TEMPLATES', () => {
  it('should have the expected number of templates', () => {
    expect(SUBSCRIPTION_TEMPLATES.length).toBe(18);
  });

  it('should have no duplicate IDs', () => {
    const ids = SUBSCRIPTION_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it.each(SUBSCRIPTION_TEMPLATES)(
    '$id should have all required fields',
    template => {
      expect(typeof template.id).toBe('string');
      expect(template.id.length).toBeGreaterThan(0);
      expect(typeof template.nameKey).toBe('string');
      expect(template.nameKey.length).toBeGreaterThan(0);
      expect(typeof template.icon).toBe('string');
      expect(template.icon.length).toBeGreaterThan(0);
      expect(typeof template.serviceUrl).toBe('string');
      expect(template.serviceUrl).toMatch(/^https?:\/\//);
      expect(typeof template.category).toBe('string');
      expect(template.category.length).toBeGreaterThan(0);
      expect(['monthly', 'yearly']).toContain(template.defaultBillingCycle);
    },
  );

  it('should have all nameKey values following templates.* pattern', () => {
    for (const template of SUBSCRIPTION_TEMPLATES) {
      expect(template.nameKey).toMatch(/^templates\..+$/);
    }
  });

  it('should only contain valid categories', () => {
    const validCategories = ['video', 'music', 'cloud', 'ai', 'sports'];
    for (const template of SUBSCRIPTION_TEMPLATES) {
      expect(validCategories).toContain(template.category);
    }
  });
});
