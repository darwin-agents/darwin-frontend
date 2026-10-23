<script setup lang="ts">
import * as THREE from 'three'

// The living specimen: one fixed WebGL canvas behind every chapter. It sits above section
// backgrounds and below their content (sections don't create stacking contexts), and
// morphs toward the active chapter's config from useLabChapter(). A chapter can place it
// precisely with an element marked `data-specimen-anchor` (`data-specimen-fill` = the
// organism's diameter as a fraction of that element's width).

const mountRef = useTemplateRef<HTMLDivElement>('mount')
const { active, stage, focus, killed } = useLabChapter()
const vitals = useState('lab-vitals', () => ({ bpm: 63, alive: true }))
const audio = useLabAudio()

interface Params {
  x: number; y: number; scale: number; presence: number; dark: number
  split: number; decay: number; alert: number; flow: number; rate: number; noise: number
}

// Thesis rows steer the specimen so each metaphor is visible.
const FOCUS: Record<string, Partial<Params>> = {
  genome: { noise: 0.35 },
  soma: { noise: 1.8 },
  neurons: { rate: 1.3 },
  metabolism: { flow: 1 },
  food: { flow: 1, rate: 1.3 },
  hunger: { flow: -0.7, rate: 0.7 },
  death: { decay: 0.85, rate: 0 },
  reproduction: { split: 0.5 },
  generation: { split: 1 },
  mutation: { noise: 2.4 },
  selection: { alert: 0.5 },
  owner: { alert: 1 },
}

const STAGE: Partial<Params>[] = [
  { flow: 0.5, noise: 0.7 }, // birth
  { rate: 1.75 }, // heartbeat
  { flow: 1 }, // metabolism
  { alert: 1, rate: 1.35 }, // escalation
  { split: 1 }, // reproduction
  { decay: 1, rate: 0, flow: -0.5 }, // death
]

// Simplex noise: Ashima Arts / Stefan Gustavson (MIT).
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const VERT = /* glsl */ `
uniform float uTime, uPulse, uNoise, uDecay, uFreq;
uniform vec2 uPointer;
varying vec3 vNormal; varying vec3 vView; varying float vDisp;
${NOISE}
void main(){
  vec3 p = position;
  float n = snoise(p * uFreq + vec3(uTime * 0.2)) * 0.13 + snoise(p * uFreq * 2.3 - vec3(uTime * 0.33)) * 0.035;
  float disp = n * uNoise * (1.0 + uDecay * 1.6) + uPulse * 0.07;
  float toward = max(dot(normalize(p), normalize(vec3(uPointer, 0.7))), 0.0);
  disp += pow(toward, 7.0) * 0.1;
  vec4 mv = modelViewMatrix * vec4(p + normal * disp, 1.0);
  vDisp = disp; vView = normalize(-mv.xyz); vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`

const FRAG = /* glsl */ `
uniform vec3 uBody; uniform float uAlert, uDecay, uOpacity, uDark, uCore;
varying vec3 vNormal; varying vec3 vView; varying float vDisp;
void main(){
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
  vec3 body = mix(uBody, vec3(1.0, 0.7, 0.18), uAlert * 0.65);
  vec3 rim = mix(vec3(0.45, 0.14, 0.04), vec3(1.0, 0.66, 0.42), uDark);
  vec3 col = mix(body * (0.85 + uDark * 0.25), rim, fres * (1.0 - uCore * 0.5)) + vDisp * 0.9;
  col = mix(col, vec3(dot(col, vec3(0.3, 0.59, 0.11))) * 0.55, uDecay);
  gl_FragColor = vec4(col, (0.22 + uCore * 0.45 + fres * 0.62) * uOpacity);
}`

onMounted(() => {
  const mount = mountRef.value
  if (!mount) return
  const mobile = window.innerWidth < 768
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  mount.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.z = 6

  const makeMat = (body: string, core: number, freq: number) =>
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 }, uPulse: { value: 0 }, uNoise: { value: 1 }, uDecay: { value: 0 },
        uFreq: { value: freq }, uPointer: { value: new THREE.Vector2() }, uBody: { value: new THREE.Color(body) },
        uAlert: { value: 0 }, uOpacity: { value: 0 }, uDark: { value: 0 }, uCore: { value: core },
      },
    })
  const membraneMat = makeMat('#ff5b1f', 0, 1.25)
  const nucleusMat = makeMat('#c93f0a', 1, 2.6)
  const childMat = makeMat('#ff7a3d', 0, 1.6)
  const grandMat = makeMat('#ffa26b', 0, 1.9)
  const mats = [membraneMat, nucleusMat, childMat, grandMat]
  const membraneGeo = new THREE.IcosahedronGeometry(1, mobile ? 24 : 64)
  const nucleusGeo = new THREE.IcosahedronGeometry(0.34, mobile ? 12 : 24)

  function body(membrane = membraneMat) {
    const g = new THREE.Group()
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat)
    const shell = new THREE.Mesh(membraneGeo, membrane)
    shell.renderOrder = 1
    g.add(nucleus, shell)
    return g
  }
  const root = new THREE.Group()
  const parent = body()
  root.add(parent)
  scene.add(root)

  // Lineage colony. The mother (with the 13 neurons) stays at the root; children bud
  // around her, and the successful ones bud a next generation. `split` 0…1 grows it:
  // children over the first half, grandchildren over the second. Threads = lineage.
  const CHILD_R = 0.4
  const GRAND_R = 0.2
  const children = Array.from({ length: 5 }, (_, i) => {
    const g = body(childMat)
    root.add(g)
    return { g, a: (i / 5) * Math.PI * 2 + 0.4, lift: i % 2 ? 0.3 : -0.22 }
  })
  const grands = [0, 0, 2, 2, 3, 3].map((p, j) => {
    const g = body(grandMat)
    root.add(g)
    return { g, parent: p, off: j % 2 ? 0.6 : -0.6 }
  })
  const threadPos = new Float32Array((children.length + grands.length) * 6)
  const threadGeo = new THREE.BufferGeometry()
  threadGeo.setAttribute('position', new THREE.BufferAttribute(threadPos, 3))
  const threadMat = new THREE.LineBasicMaterial({ color: '#ff5b1f', transparent: true, depthWrite: false })
  root.add(new THREE.LineSegments(threadGeo, threadMat))
  const tmp = new THREE.Vector3()
  /** Thread i runs between the surfaces of two bodies, not their centres. */
  function thread(i: number, a: THREE.Vector3, ra: number, b: THREE.Vector3, rb: number) {
    tmp.subVectors(b, a)
    const len = tmp.length() || 1
    tmp.divideScalar(len)
    const s = Math.min(ra, len / 2), e = Math.max(len - rb, len / 2)
    threadPos.set([a.x + tmp.x * s, a.y + tmp.y * s, a.z + tmp.z * s, a.x + tmp.x * e, a.y + tmp.y * e, a.z + tmp.z * e], i * 6)
  }
  const bud = (s: number, start: number) => {
    const x = Math.min(1, Math.max(0, (s - start) / 0.22))
    return x * x * (3 - 2 * x)
  }

  // 13 organelles = the 13 built-in neurons.
  const organelleMat = new THREE.MeshBasicMaterial({ color: '#0a0a0a', transparent: true })
  const organelles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 12, 12), organelleMat, 13)
  parent.add(organelles)
  const orbits = Array.from({ length: 13 }, (_, i) => ({
    r: 0.48 + (i % 4) * 0.08,
    speed: 0.25 + ((i * 7) % 5) * 0.08,
    tilt: (i / 13) * Math.PI,
    phase: i * 1.7,
  }))
  const m4 = new THREE.Matrix4()
  const v3 = new THREE.Vector3()

  // Nutrients stream in (earning) or out (spending).
  const N = mobile ? 220 : 520
  const radius = new Float32Array(N)
  const dirs: THREE.Vector3[] = []
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    radius[i] = 1.3 + Math.random() * 2.6
    dirs.push(new THREE.Vector3().randomDirection())
  }
  const nutrientGeo = new THREE.BufferGeometry()
  nutrientGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const nutrientMat = new THREE.PointsMaterial({ color: '#ff5b1f', size: 0.03, transparent: true, depthWrite: false })
  const nutrients = new THREE.Points(nutrientGeo, nutrientMat)
  root.add(nutrients)

  let anchor: HTMLElement | null = null
  const findAnchor = () => {
    anchor = document.querySelector<HTMLElement>(`[data-chapter="${active.value}"] [data-specimen-anchor]`)
  }
  findAnchor()

  function targets(): Params {
    const cfg = CHAPTERS[active.value]
    let t: Params = {
      x: cfg.x, y: 0, scale: cfg.scale, presence: cfg.presence, dark: cfg.dark ? 1 : 0,
      split: 0, decay: 0, alert: 0, flow: 0.15, rate: 1.05, noise: 1,
    }
    if (active.value === 'lifecycle') t = { ...t, ...STAGE[stage.value] }
    if (active.value === 'thesis' && focus.value) t = { ...t, ...FOCUS[focus.value] }
    if (active.value === 'evolution') t.split = 1
    if (killed.value) t = { ...t, decay: 1, rate: 0, flow: 0, alert: 0, split: 0 }
    const r = anchor?.getBoundingClientRect()
    if (r && r.width > 0) {
      // Lives in its slot: follow it, and fade as the slot scrolls out of view.
      t.x = ((r.left + r.width / 2) / innerWidth) * 2 - 1
      t.y = 1 - ((r.top + r.height / 2) / innerHeight) * 2
      const fill = Number(anchor!.dataset.specimenFill ?? 0.6)
      t.scale = ((r.width * fill) / innerHeight) * halfH // world radius from pixel diameter
      const visible = (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height
      t.presence *= Math.min(1, Math.max(0, visible * 1.6 - 0.3))
    } else if (innerWidth < 768) {
      // Phones: no room beside the text, so only the finale keeps a faint specimen.
      t.x *= 0.25
      t.scale *= 0.72
      t.presence = active.value === 'cta' ? Math.min(t.presence, 0.45) : 0
    }
    return t
  }

  let halfW = 1
  let halfH = 1
  const cur = { ...targets(), scale: 0.02, presence: 0 }
  const pointer = new THREE.Vector2()
  const pointerTarget = new THREE.Vector2()
  const onMove = (e: PointerEvent) => {
    pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const resize = () => {
    const w = mount.clientWidth, h = mount.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    halfW = halfH * camera.aspect
    renderer.render(scene, camera)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  let last = performance.now()
  let phase = 0
  let lastBeat = 0
  let lastVitals = 0
  let cleared = false

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    const t = targets()
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.6)
    for (const key in t) {
      const p = key as keyof Params
      if (p !== 'split') cur[p] += (t[p] - cur[p]) * k
    }
    // The colony grows slowly enough to watch each bud appear.
    cur.split += (t.split - cur.split) * (reduced ? 1 : 1 - Math.exp(-dt * (t.split > cur.split ? 0.55 : 2.5)))
    pointer.lerp(pointerTarget, reduced ? 1 : 1 - Math.exp(-dt * 4))

    // Lub-dub pulse at `rate` beats per second.
    phase += dt * cur.rate
    const f = phase % 1
    const pulse = Math.exp(-f * 14) + (f > 0.2 ? 0.55 * Math.exp(-(f - 0.2) * 14) : 0)
    if (Math.floor(phase) !== lastBeat) {
      lastBeat = Math.floor(phase)
      const audible = active.value === 'hero' || (active.value === 'lifecycle' && stage.value === 1)
      if (audible && !killed.value) audio.heartbeat()
    }
    if (now - lastVitals > 250) {
      lastVitals = now
      const bpm = cur.rate < 0.08 ? 0 : Math.round(cur.rate * 60)
      const alive = !killed.value && bpm > 0
      if (vitals.value.bpm !== bpm || vitals.value.alive !== alive) vitals.value = { bpm, alive }
    }

    const time = now / 1000
    for (const mat of mats) {
      const u = mat.uniforms
      u.uTime!.value = time
      u.uPulse!.value = reduced ? 0 : pulse * (1 - cur.decay)
      u.uNoise!.value = cur.noise
      u.uDecay!.value = cur.decay
      u.uAlert!.value = cur.alert
      u.uOpacity!.value = cur.presence
      u.uDark!.value = cur.dark
      ;(u.uPointer!.value as THREE.Vector2).copy(pointer)
    }

    root.position.x = cur.x * halfW
    root.position.y = cur.y * halfH + Math.sin(time * 0.4) * 0.05 - cur.decay * 0.25
    // Shrink the whole colony as it spreads so it stays inside its slot.
    root.scale.setScalar((cur.scale * (1 - cur.decay * 0.3) * (1 + pulse * 0.015)) / (1 + 1.25 * cur.split))
    root.rotation.y = pointer.x * 0.25 + Math.sin(time * 0.05) * (1 - cur.split) * 0.6
    root.rotation.x = -pointer.y * 0.15

    const spin = time * 0.07
    children.forEach((c, i) => {
      const k = bud(cur.split, i * 0.07)
      const a = c.a + spin
      c.g.visible = k > 0.01
      c.g.position.set(Math.cos(a) * 1.95 * k, (Math.sin(a) * 0.62 + c.lift) * 1.95 * k, Math.sin(a) * 0.25 * k)
      c.g.scale.setScalar(Math.max(0.0001, CHILD_R * k))
      thread(i, parent.position, 1, c.g.position, CHILD_R * k)
    })
    grands.forEach((g, j) => {
      const p = children[g.parent]!.g.position
      const k = bud(cur.split, 0.55 + j * 0.06)
      const a = children[g.parent]!.a + spin + g.off
      g.g.visible = k > 0.01
      g.g.position.set(p.x + Math.cos(a) * 0.72 * k, p.y + Math.sin(a) * 0.5 * k, p.z + Math.sin(a) * 0.12 * k)
      g.g.scale.setScalar(Math.max(0.0001, GRAND_R * k))
      thread(children.length + j, p, CHILD_R, g.g.position, GRAND_R * k)
    })
    threadGeo.attributes.position!.needsUpdate = true
    threadMat.opacity = cur.presence * Math.min(1, cur.split * 4) * 0.55
    threadMat.color.set(cur.dark > 0.5 ? '#ff8a5b' : '#c93f0a')

    organelleMat.color.set(cur.dark > 0.5 ? '#f3eee2' : '#0a0a0a')
    organelleMat.opacity = cur.presence * (1 - cur.decay * 0.6)
    for (let i = 0; i < 13; i++) {
      const o = orbits[i]!
      const a = time * o.speed * (1 - cur.decay) + o.phase
      const r = o.r * (1 + cur.decay * 1.1)
      v3.set(Math.cos(a) * r, Math.sin(a) * r * Math.cos(o.tilt) - cur.decay * 0.5, Math.sin(a) * r * Math.sin(o.tilt))
      organelles.setMatrixAt(i, m4.makeTranslation(v3))
    }
    organelles.instanceMatrix.needsUpdate = true

    const speed = cur.flow * dt * 0.9
    for (let i = 0; i < N; i++) {
      let r = radius[i]! - speed
      if (r < 1.05) r = 3.9
      else if (r > 3.9) r = 1.1
      radius[i] = r
      const d = dirs[i]!
      pos[i * 3] = d.x * r
      pos[i * 3 + 1] = d.y * r
      pos[i * 3 + 2] = d.z * r
    }
    nutrientGeo.attributes.position!.needsUpdate = true
    nutrientMat.opacity = cur.presence * (0.12 + Math.abs(cur.flow) * 0.55)
    nutrientMat.color.set(cur.flow < 0 ? '#8a857a' : '#ff5b1f')

    // Nothing to see: keep lerping but skip the GPU work.
    if (cur.presence < 0.004 && t.presence === 0) {
      if (!cleared) { renderer.clear(); cleared = true }
      return
    }
    cleared = false
    renderer.render(scene, camera)
  }

  const stopLoop = useRenderLoop(mount, frame)
  // Reduced motion draws on change only.
  const stopWatch = watch([active, stage, focus, killed], () => {
    findAnchor()
    if (reduced) frame(performance.now())
  })
  // A fresh specimen grows from nothing after a kill.
  watch(killed, (k) => { if (!k) cur.scale = 0.02 })

  onUnmounted(() => {
    stopLoop()
    stopWatch()
    ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    for (const o of [membraneGeo, nucleusGeo, organelles.geometry, nutrientGeo, threadGeo, ...mats, organelleMat, nutrientMat, threadMat]) o.dispose()
    renderer.dispose()
    mount.removeChild(renderer.domElement)
  })
})
</script>

<template>
  <div ref="mount" class="specimen-layer" aria-hidden="true" />
</template>

<style scoped>
.specimen-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.specimen-layer :deep(canvas) { width: 100%; height: 100%; display: block; }
</style>
