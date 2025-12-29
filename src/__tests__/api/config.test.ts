import { GET } from '@/app/api/config/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map([['content-type', 'application/json']]),
    })),
  },
}));

jest.mock('@/lib/config', () => ({
  getClientSafeConfig: jest.fn(() => ({
    site: {
      name: 'Test Site',
      url: 'http://localhost:3000',
    },
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
    },
    chat: {
      enabled: true,
      button: {
        position: 'bottom-center',
      },
    },
    features: {
      search: true,
      blog: true,
    },
  })),
}));

describe('GET /api/config', () => {
  it('should return client-safe configuration', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('site');
    expect(data).toHaveProperty('branding');
    expect(data).toHaveProperty('chat');
    expect(data).toHaveProperty('features');
  });

  it('should not include sensitive data', async () => {
    const response = await GET();
    const data = await response.json();
    const dataStr = JSON.stringify(data);
    
    expect(dataStr).not.toContain('apiKey');
    expect(dataStr).not.toContain('secret');
    expect(dataStr).not.toContain('password');
  });

  it('should have correct content type', async () => {
    const response = await GET();
    
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
