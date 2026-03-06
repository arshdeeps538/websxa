import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'search',
    description: 'Search the web using a provider',
  },
  args: {
    query: {
      type: 'positional',
      description: 'Search query',
      required: true,
    },
    provider: {
      type: 'string',
      description: 'Search provider to use',
      default: 'exa',
    },
    'max-results': {
      type: 'string',
      description: 'Maximum number of results',
      default: '10',
    },
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  },
  async run({ args }) {
    await import('../providers/index.ts')

    const { create } = await import('../core/registry.ts')
    const { AuthError, UnknownProviderError } = await import('../core/errors.ts')

    try {
      const provider = create(args.provider, {})
      const results = await provider.search(args.query, {
        maxResults: parseInt(args['max-results'], 10),
      })

      if (args.json) {
        process.stdout.write(`${JSON.stringify(results, null, 2)}\n`)
        return
      }

      if (results.length === 0) {
        consola.info('No results found.')
        return
      }

      for (const result of results) {
        consola.log(`\x1b[1m\x1b[36m${result.title}\x1b[0m`)
        consola.log(`  ${result.url}`)
        if (result.snippet) {
          const truncated = result.snippet.length > 120
            ? result.snippet.slice(0, 120) + '...'
            : result.snippet
          consola.log(`  \x1b[90m${truncated}\x1b[0m`)
        }
        consola.log('')
      }
    }
    catch (error) {
      if (error instanceof AuthError) {
        consola.error(`Authentication failed for provider "${args.provider}".`)
        consola.info(`Set the ${args.provider.toUpperCase()}_API_KEY environment variable.`)
        process.exit(1)
      }
      if (error instanceof UnknownProviderError) {
        const { providers } = await import('../core/registry.ts')
        consola.error(`Unknown provider: ${args.provider}`)
        const available = providers()
        if (available.length > 0) {
          consola.info(`Available providers: ${available.join(', ')}`)
        } else {
          consola.info('No providers registered. Import a provider first.')
        }
        process.exit(1)
      }
      throw error
    }
  },
})
