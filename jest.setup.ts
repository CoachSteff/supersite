import '@testing-library/jest-dom'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
} else {
  global.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

const mockWriteText = jest.fn(() => Promise.resolve())
const mockReadText = jest.fn(() => Promise.resolve(''))

// Make mocks globally accessible for test assertions
;(global as any).mockClipboard = {
  writeText: mockWriteText,
  readText: mockReadText,
}

// Only mock navigator in jsdom environment (not in node environment)
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: mockWriteText,
      readText: mockReadText,
    },
  })
}

global.alert = jest.fn()

beforeEach(() => {
  mockWriteText.mockClear()
  mockReadText.mockClear()
})

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(public url: string, public init?: RequestInit) {}
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body?: any, public init?: ResponseInit) {}
    
    json() {
      return Promise.resolve(this.body)
    }
    
    static json(data: any, init?: ResponseInit) {
      return new Response(data, init)
    }
  } as any
}
