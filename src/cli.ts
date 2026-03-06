#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { version } from './version.ts'

const main = defineCommand({
  meta: {
    name: 'webxa',
    version,
    description: 'Unified web search provider for agents and CLI',
  },
  subCommands: {
    search: () => import('./commands/search.ts').then(m => m.default),
    providers: () => import('./commands/providers.ts').then(m => m.default),
  },
})

await runMain(main)
