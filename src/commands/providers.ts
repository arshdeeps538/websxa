import { defineCommand } from 'citty'
import { consola } from 'consola'
import { builtinProviders, version } from '../index.ts'

export default defineCommand({
  meta: {
    name: 'providers',
    description: 'List built-in providers',
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Print providers as JSON',
      default: false,
    },
  },
  run({ args }) {
    if (args.json) {
      process.stdout.write(`${JSON.stringify(builtinProviders, null, 2)}\n`)
      return
    }

    consola.log(`webxa ${version}`)
    for (const provider of builtinProviders) {
      consola.log(`- ${provider}`)
    }
  },
})
