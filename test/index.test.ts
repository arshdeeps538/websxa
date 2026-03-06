import { describe, expect, it } from 'vitest'
import { builtinProviders, version } from '../src/index.ts'

describe('webxa', () => {
  it('should export version matching package.json', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('should list all built-in provider names', () => {
    expect(builtinProviders).toEqual(['brave', 'exa', 'searxng', 'serpapi', 'tavily'])
  })
})
