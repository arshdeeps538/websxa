import type { SearchProvider, ProviderConfig, ProviderFactory } from './types'
import { UnknownProviderError } from './errors'

const factories = new Map<string, ProviderFactory>()
const defaultURLs = new Map<string, string>()

/**
 * Register a provider factory with the registry.
 * Called by providers on import to self-register.
 */
export function register(
  name: string,
  defaultURL: string,
  factory: ProviderFactory
): void {
  factories.set(name, factory)
  defaultURLs.set(name, defaultURL)
}

/**
 * Create a provider instance by name.
 * Resolves apiKey from config or environment variable (PROVIDER_NAME_API_KEY).
 */
export function create(name: string, config?: ProviderConfig): SearchProvider {
  const factory = factories.get(name)
  if (!factory) {
    throw new UnknownProviderError(name)
  }

  const apiKey =
    config?.apiKey ||
    process.env[`${name.toUpperCase()}_API_KEY`]

  const resolvedConfig: ProviderConfig = {
    ...config,
    apiKey,
    baseURL: config?.baseURL || defaultURLs.get(name),
  }

  return factory(resolvedConfig)
}

/**
 * List all registered provider names.
 */
export function providers(): string[] {
  return Array.from(factories.keys())
}

/**
 * Check if a provider is registered.
 */
export function has(name: string): boolean {
  return factories.has(name)
}
