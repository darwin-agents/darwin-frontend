// Run: node --test tests/i18n.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { baseCompile } from '@intlify/message-compiler'

type Tree = { [k: string]: string | Tree }
const dir = new URL('../i18n/locales/', import.meta.url)
const flat = (o: Tree, p = ''): Record<string, string> =>
  Object.entries(o).reduce((acc, [k, v]) => Object.assign(acc, typeof v === 'string' ? { [p + k]: v } : flat(v, `${p}${k}.`)), {})
const load = (file: string) => flat(JSON.parse(readFileSync(new URL(file, dir), 'utf8')))
const placeholders = (m: string) => [...m.matchAll(/\{\s*(\w+)\s*\}/g)].map((x) => x[1]).sort()

const en = load('en.json')
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

test('ships the 8 most-spoken languages', () => {
  assert.deepEqual(files, ['ar', 'bn', 'en', 'es', 'fr', 'hi', 'pt', 'zh'].map((c) => `${c}.json`))
})

for (const file of files) {
  test(`${file}: same keys and placeholders as en.json, every message compiles`, () => {
    const msgs = load(file)
    assert.deepEqual(Object.keys(en).filter((k) => !(k in msgs)), [], 'missing keys')
    assert.deepEqual(Object.keys(msgs).filter((k) => !(k in en)), [], 'extra keys')
    for (const [key, m] of Object.entries(msgs)) {
      assert.ok(m.trim(), `${key} is empty`)
      assert.deepEqual(placeholders(m), placeholders(en[key]!), `${key} placeholders`)
      baseCompile(m, { onError: (e) => assert.fail(`${key}: ${e.message}`) })
    }
  })
}

test('every key the app uses exists in en.json', () => {
  const app = new URL('../app/', import.meta.url)
  const missing: string[] = []
  for (const file of readdirSync(app, { recursive: true }) as string[]) {
    if (!/\.(vue|ts)$/.test(file)) continue
    const src = readFileSync(new URL(file, app), 'utf8')
    for (const [, key] of src.matchAll(/\bt\(\s*['"]([\w.]+)['"]|keypath="([\w.]+)"/g).map((m) => [m[0], m[1] ?? m[2]])) {
      if (!(key! in en)) missing.push(`${file}: ${key}`)
    }
    // Template-literal keys (t(`lab.chapters.${id}`)): the prefix must hold messages.
    for (const [, prefix] of src.matchAll(/\bt\(\s*`([\w.]+)\$\{/g)) {
      if (!Object.keys(en).some((k) => k.startsWith(prefix!))) missing.push(`${file}: ${prefix}*`)
    }
  }
  assert.deepEqual(missing, [])
})
