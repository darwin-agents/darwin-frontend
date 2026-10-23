// Run: node --test tests/labSim.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAB_RULES, createColony, evaluatePayment, killCell, spawnCell, stepColony } from '../app/utils/labSim.ts'

const base = { balance: 140, category: 'content.affiliate', envelope: ['content.affiliate'], history: 12, recentMax: 4 }

test('treasury gates decide like treasury_policy', () => {
  assert.equal(evaluatePayment({ ...base, amount: 3 }).verdict, 'ALLOW')
  const caps = evaluatePayment({ ...base, amount: 80 })
  assert.deepEqual([caps.verdict, caps.trail.at(-1)?.gate], ['REFUSE', 'caps'])
  assert.equal(evaluatePayment({ ...base, amount: 9, sanctioned: true }).trail.at(-1)?.gate, 'forbidden')
  assert.equal(evaluatePayment({ ...base, amount: 30, balance: 20 }).trail.at(-1)?.gate, 'solvency')
  assert.equal(evaluatePayment({ ...base, amount: 4, category: 'trading.crypto' }).trail.at(-1)?.gate, 'envelope')
  assert.equal(evaluatePayment({ ...base, amount: 4, paysHuman: true }).verdict, 'ESCALATE')
  const anomaly = evaluatePayment({ ...base, amount: 4.5, recentMax: 0.18, history: 30 })
  assert.deepEqual([anomaly.verdict, anomaly.trail.at(-1)?.gate], ['ESCALATE', 'anomaly'])
})

test('colony: child gets half the surplus, the broke die after grace, kills are final', () => {
  const c = createColony(10, 0)
  const rich = spawnCell(c, { balance: 200, trait: 1 })
  rich.profit = 30
  const { born } = stepColony(c, 0, () => 0.5) // net = 1*4.5*1 - 1.5 = +3
  assert.equal(born.length, 1)
  const surplus = 203 - LAB_RULES.minViableBalance
  assert.equal(born[0]!.balance, surplus * LAB_RULES.childShare)
  assert.equal(rich.balance, 203 - surplus * LAB_RULES.childShare)
  assert.equal(born[0]!.gen, 1)

  const poor = spawnCell(c, { balance: 0.5, trait: 0 })
  for (let i = 0; i < 10; i++) stepColony(c, 1, () => 0.5)
  assert.ok(poor.dead > 0)

  const victim = spawnCell(c, { balance: 500, trait: 1 })
  killCell(c, victim)
  stepColony(c, 0, () => 0.5)
  assert.equal(victim.balance, 500) // dead cells no longer trade
})
