export interface SearchResult {
  url: string
  title: string
  snippet: string
  score?: number
  publishedDate?: string
  author?: string
  image?: string
  favicon?: string
  text?: string
  highlights?: string[]
  summary?: string
  metadata?: Record<string, unknown>
}

export interface SearchOptions {
  maxResults?: number
  includeDomains?: string[]
  excludeDomains?: string[]
  startPublishedDate?: string
  endPublishedDate?: string
  category?: string
}

export interface SearchProvider {
  name(): string
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>
}

export interface ProviderConfig {
  apiKey?: string
  baseURL?: string
}

export type ProviderFactory = (config: ProviderConfig) => SearchProvider

export interface ClientOptions {
  maxRetries?: number
  baseDelay?: number
  timeout?: number
  userAgent?: string
}
