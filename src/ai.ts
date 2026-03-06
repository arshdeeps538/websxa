import { tool } from 'ai'
import { z } from 'zod'
import { create } from './core/registry.ts'
import { searchAll } from './core/all.ts'
import './providers/index.ts'

/**
 * Ready-made AI SDK tool for web search.
 * Pass to `generateText({ tools: { webSearch: searchTool } })`.
 * Set provider to `"all"` to query every available provider in parallel.
 */
export const searchTool = tool({
  description: 'Search the web using multiple search engines. Returns relevant web pages with titles, URLs, snippets, and optional metadata like scores and publication dates. Use provider "all" to query all available providers in parallel and get deduplicated results.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find relevant web pages'),
    provider: z.enum(['brave', 'exa', 'searxng', 'serpapi', 'tavily', 'all']).optional().describe('Search provider to use. Use "all" to query all available providers in parallel. Defaults to the first available provider based on environment variables.'),
    maxResults: z.number().min(1).max(20).optional().describe('Maximum number of results to return. Defaults to 10.'),
  }),
  execute: async ({ query, provider: providerName, maxResults }) => {
    if (providerName === 'all') {
      return searchAll(query, { maxResults })
    }

    const name = providerName ?? resolveDefaultProvider()
    const provider = create(name)
    const results = await provider.search(query, { maxResults })
    return results
  },
})

function resolveDefaultProvider(): string {
  const envMap: Record<string, string> = {
    EXA_API_KEY: 'exa',
    BRAVE_API_KEY: 'brave',
    TAVILY_API_KEY: 'tavily',
    SERPAPI_API_KEY: 'serpapi',
  }

  for (const [envVar, name] of Object.entries(envMap)) {
    if (process.env[envVar]) {
      return name
    }
  }

  return 'searxng'
}
