<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const auth = useAuthStore()

const form = reactive({
  secret_type: 'vcc',
  pan: '',
  cvv: '',
  expiry: '',
  spend_limit: 50,
})

const savedSecrets = ref<{ ref: string; type: string; spend_limit?: number }[]>([])
const api = useApi()

function maskRef(ref: string) {
  if (ref.length <= 8) return ref
  return `${ref.slice(0, 6)}…${ref.slice(-4)}`
}

async function saveSecret() {
  const uid = auth.userId
  if (!uid) return
  const body = {
    darwin_id: props.darwinId,
    secret_type: form.secret_type,
    payload: { ...form },
  }
  try {
    const resp = await api.post<{ ref: string; spend_limit?: number }>(`/users/${uid}/vault`, body)
    form.pan = ''
    form.cvv = ''
    form.expiry = ''
    savedSecrets.value.push({ ref: resp.ref, type: form.secret_type, spend_limit: resp.spend_limit })
  } catch {
    /* backend may not implement yet */
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="secret in savedSecrets"
      :key="secret.ref"
      class="flex items-center justify-between text-xs bg-white/5 rounded p-2"
    >
      <span class="font-mono text-slate-300">{{ maskRef(secret.ref) }}</span>
      <span class="text-slate-500">{{ secret.type }} · ${{ secret.spend_limit ?? '—' }} limit</span>
    </div>
    <div class="space-y-2 border-t border-white/10 pt-3">
      <select v-model="form.secret_type" class="darwin-input w-full text-sm">
        <option value="vcc">Virtual Credit Card</option>
        <option value="stripe_key">Stripe API Key</option>
        <option value="broker_api_key">Broker API Key</option>
        <option value="iban">IBAN</option>
      </select>
      <template v-if="form.secret_type === 'vcc'">
        <input v-model="form.pan" type="text" maxlength="19" placeholder="4111…" class="darwin-input w-full font-mono" />
        <div class="grid grid-cols-2 gap-2">
          <input v-model="form.cvv" type="password" maxlength="4" placeholder="CVV" class="darwin-input" />
          <input v-model="form.expiry" type="text" maxlength="5" placeholder="MM/YY" class="darwin-input" />
        </div>
        <input v-model.number="form.spend_limit" type="number" placeholder="Spend limit ($)" class="darwin-input w-full" />
      </template>
      <button type="button" class="darwin-btn-primary w-full text-sm" @click="saveSecret">Save to Vault</button>
    </div>
  </div>
</template>
