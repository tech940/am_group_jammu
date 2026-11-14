/**
 * Loads the project's env files into process.env for a plain `node` script.
 *
 * Import this FIRST, before anything from lib/: lib/supabase.ts and the Motors
 * client read process.env the moment they are evaluated, and ES module imports
 * are evaluated in the order they are written. Importing this file for its
 * side effect is what makes the values exist by the time those modules run.
 *
 * It is a small parser rather than a dependency or `node --env-file` so that
 * `npm run cars:import` needs no extra flags, a missing file is not an error,
 * and .env.local takes precedence the way it does in Next. Keys are trimmed
 * (the real .env has a line with a space before the "="). Values are never
 * printed.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Same precedence as Next: .env.local wins over .env, and a variable already
// set in the shell wins over both.
const FILES = ['../../.env.local', '../../.env']

export const loadedEnvFiles: string[] = []

for (const rel of FILES) {
  const path = fileURLToPath(new URL(rel, import.meta.url))
  let text: string
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    continue // the file is optional
  }
  loadedEnvFiles.push(rel.replace('../../', ''))

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue

    const key = line.slice(0, eq).replace(/^export\s+/, '').trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

    let value = line.slice(eq + 1).trim()
    const quote = value[0]
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length >= 2) {
      value = value.slice(1, -1)
    } else {
      // An unquoted value ends at a " #" comment.
      const hash = value.search(/\s#/)
      if (hash !== -1) value = value.slice(0, hash).trim()
    }

    if (process.env[key] === undefined) process.env[key] = value
  }
}
