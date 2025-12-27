/**
 * @jest-environment node
 */

import { GET } from '@/app/api/navigation/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

jest.mock('@/lib/markdown', () => ({
  getFolderStructure: jest.fn(() => [
    { title: 'About', path: '/about' },
    { title: 'Blog', path: '/blog' },
    { title: 'Services', path: '/services', children: [
      { title: 'Consulting', path: '/services/consulting' },
    ]},
  ]),
}));

describe('GET /api/navigation', () => {
  it('should return navigation structure', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('should include auto-generated navigation', async () => {
    const response = await GET();
    const data = await response.json();
    
    const aboutItem = data.items.find((item: any) => item.path === '/about');
    expect(aboutItem).toBeDefined();
    expect(aboutItem.title).toBe('About');
  });

  it('should include custom links', async () => {
    const response = await GET();
    const data = await response.json();
    
    const blogItem = data.items.find((item: any) => item.path === '/blog');
    expect(blogItem).toBeDefined();
    expect(blogItem.title).toBe('Blog');
  });

  it('should include nested navigation', async () => {
    const response = await GET();
    const data = await response.json();
    
    const servicesItem = data.items.find((item: any) => item.path === '/services');
    expect(servicesItem).toBeDefined();
    expect(servicesItem.children).toBeDefined();
    expect(servicesItem.children.length).toBeGreaterThan(0);
  });
});
