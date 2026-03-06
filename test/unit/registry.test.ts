import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register, has, providers, create } from '../../src/core/registry'
import { UnknownProviderError } from '../../src/core/errors'
import type { ProviderFactory, SearchProvider } from '../../src/core/types'

describe('registry', () => {
  // Use unique names per test to avoid collisions with module-level Maps
  const testProviderName = `testprovider${Math.random().toString(36).slice(2)}`
  const testProviderName2 = `testprovider${Math.random().toString(36).slice(2)}`
  const envVarName = `${testProviderName.toUpperCase()}_API_KEY`

  const mockFactory: ProviderFactory = (config) => ({
    name: () => 'mock',
    search: vi.fn().mockResolvedValue([]),
  })

  beforeEach(() => {
    // Clean up environment variables before each test
    delete process.env[envVarName]
  })

  describe('register() + has()', () => {
    it('should register a provider and has() returns true', () => {
      register(testProviderName, 'https://api.example.com', mockFactory)
      expect(has(testProviderName)).toBe(true)
    })

    it('should return false for unregistered providers', () => {
      const unregisteredName = `nonexistent-${Math.random().toString(36).slice(2)}`
      expect(has(unregisteredName)).toBe(false)
    })
  })

  describe('providers()', () => {
    it('should include registered provider names', () => {
      register(testProviderName, 'https://api.example.com', mockFactory)
      const allProviders = providers()
      expect(allProviders).toContain(testProviderName)
    })

    it('should return array of all registered providers', () => {
      register(testProviderName, 'https://api.example.com', mockFactory)
      register(testProviderName2, 'https://api2.example.com', mockFactory)
      const allProviders = providers()
      expect(allProviders).toContain(testProviderName)
      expect(allProviders).toContain(testProviderName2)
      expect(Array.isArray(allProviders)).toBe(true)
    })
  })

  describe('create()', () => {
    it('should create a provider instance with name() and search() methods', () => {
      register(testProviderName, 'https://api.example.com', mockFactory)
      const provider = create(testProviderName)
      expect(provider).toBeDefined()
      expect(typeof provider.name).toBe('function')
      expect(typeof provider.search).toBe('function')
      expect(provider.name()).toBe('mock')
    })

    it('should pass config.apiKey through to factory', () => {
      const capturedConfigs: any[] = []
      const trackingFactory: ProviderFactory = (config) => {
        capturedConfigs.push(config)
        return {
          name: () => 'tracking-mock',
          search: vi.fn().mockResolvedValue([]),
        }
      }

      register(testProviderName, 'https://api.example.com', trackingFactory)
      const testApiKey = 'test-api-key-12345'
      create(testProviderName, { apiKey: testApiKey })

      expect(capturedConfigs).toHaveLength(1)
      expect(capturedConfigs[0].apiKey).toBe(testApiKey)
    })

    it('should read env var when no config.apiKey is provided', () => {
      const capturedConfigs: any[] = []
      const trackingFactory: ProviderFactory = (config) => {
        capturedConfigs.push(config)
        return {
          name: () => 'tracking-mock',
          search: vi.fn().mockResolvedValue([]),
        }
      }

      register(testProviderName, 'https://api.example.com', trackingFactory)
      const envApiKey = 'env-api-key-67890'
      process.env[envVarName] = envApiKey

      create(testProviderName)

      expect(capturedConfigs).toHaveLength(1)
      expect(capturedConfigs[0].apiKey).toBe(envApiKey)
    })

    it('should prefer config.apiKey over environment variable', () => {
      const capturedConfigs: any[] = []
      const trackingFactory: ProviderFactory = (config) => {
        capturedConfigs.push(config)
        return {
          name: () => 'tracking-mock',
          search: vi.fn().mockResolvedValue([]),
        }
      }

      register(testProviderName, 'https://api.example.com', trackingFactory)
      const configApiKey = 'config-api-key'
      const envApiKey = 'env-api-key'
      process.env[envVarName] = envApiKey

      create(testProviderName, { apiKey: configApiKey })

      expect(capturedConfigs).toHaveLength(1)
      expect(capturedConfigs[0].apiKey).toBe(configApiKey)
    })

    it('should throw UnknownProviderError for unregistered provider names', () => {
      const unregisteredName = `unknown-${Math.random().toString(36).slice(2)}`
      expect(() => create(unregisteredName)).toThrow(UnknownProviderError)
      expect(() => create(unregisteredName)).toThrow(
        `Unknown provider: ${unregisteredName}`
      )
    })

    it('should pass baseURL from config to factory', () => {
      const capturedConfigs: any[] = []
      const trackingFactory: ProviderFactory = (config) => {
        capturedConfigs.push(config)
        return {
          name: () => 'tracking-mock',
          search: vi.fn().mockResolvedValue([]),
        }
      }

      register(testProviderName, 'https://default.example.com', trackingFactory)
      const customBaseURL = 'https://custom.example.com'
      create(testProviderName, { baseURL: customBaseURL })

      expect(capturedConfigs).toHaveLength(1)
      expect(capturedConfigs[0].baseURL).toBe(customBaseURL)
    })

    it('should use default baseURL from registration when not in config', () => {
      const capturedConfigs: any[] = []
      const trackingFactory: ProviderFactory = (config) => {
        capturedConfigs.push(config)
        return {
          name: () => 'tracking-mock',
          search: vi.fn().mockResolvedValue([]),
        }
      }

      const defaultURL = 'https://default.example.com'
      register(testProviderName, defaultURL, trackingFactory)
      create(testProviderName)

      expect(capturedConfigs).toHaveLength(1)
      expect(capturedConfigs[0].baseURL).toBe(defaultURL)
    })
  })
})
