import { getSiteConfig, validateConfig, getClientSafeConfig } from '@/lib/config';

describe('Config', () => {
  describe('getSiteConfig', () => {
    it('should load and validate configuration', () => {
      const config = getSiteConfig();
      
      expect(config).toHaveProperty('site');
      expect(config).toHaveProperty('branding');
      expect(config).toHaveProperty('chat');
      expect(config).toHaveProperty('features');
    });

    it('should have required site fields', () => {
      const config = getSiteConfig();
      
      expect(config.site.name).toBeDefined();
      expect(config.site.url).toBeDefined();
    });

    it('should have valid chat configuration', () => {
      const config = getSiteConfig();
      
      expect(config.chat.enabled).toBeDefined();
      expect(config.chat.provider).toMatch(/^(anthropic|openai|gemini|ollama)$/);
    });
  });

  describe('getClientSafeConfig', () => {
    it('should return client-safe configuration', () => {
      const config = getClientSafeConfig();
      
      expect(config).toHaveProperty('site');
      expect(config).toHaveProperty('branding');
      expect(config).toHaveProperty('chat');
      expect(config).toHaveProperty('features');
    });

    it('should not include sensitive data', () => {
      const config = getClientSafeConfig();
      const configStr = JSON.stringify(config);
      
      expect(configStr).not.toContain('apiKey');
      expect(configStr).not.toContain('secret');
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      expect(validateConfig()).toBe(true);
    });
  });
});
