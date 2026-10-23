<script setup lang="ts">
import * as THREE from 'three'

interface Props {
  organIndex: number
  accent?: string
  hue?: string
}

const props = withDefaults(defineProps<Props>(), {
  accent: '#ff5b1f',
  hue: '#f3eee2',
})

const mountRef = useTemplateRef<HTMLDivElement>('mount')

function disposeObject3D(root: THREE.Object3D) {
  const geoms = new Set<THREE.BufferGeometry>()
  const mats = new Set<THREE.Material>()
  root.traverse((obj) => {
    if ('geometry' in obj && (obj as THREE.Mesh).geometry instanceof THREE.BufferGeometry)
      geoms.add((obj as THREE.Mesh).geometry)
    const raw = 'material' in obj ? (obj as THREE.Mesh).material : undefined
    if (Array.isArray(raw))
      raw.forEach((m) => mats.add(m))
    else if (raw)
      mats.add(raw)
  })
  geoms.forEach((geo) => geo.dispose())
  mats.forEach((mat) => mat.dispose())
}

function buildScene(idx: number, accentHex: string, hueHex: string): THREE.Group {
  const accent = new THREE.Color(accentHex)
  const hue = new THREE.Color(hueHex)
  const ink = new THREE.Color('#0a0a0a')
  const g = new THREE.Group()

  const matAccent = new THREE.MeshStandardMaterial({ color: accent, metalness: 0.2, roughness: 0.35 })
  const matHue = new THREE.MeshStandardMaterial({ color: hue, metalness: 0.35, roughness: 0.45 })
  const matInk = new THREE.MeshStandardMaterial({ color: ink, metalness: 0.55, roughness: 0.4 })
  const matWire = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  })

  switch (idx) {
    case 0: {
      /** Goal Engine — knot + orbiting anchors (reads as trajectory field, not helix). */
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.48, 0.13, 120, 12, 2, 3),
        matAccent,
      )
      g.add(knot)

      const anchorGeo = new THREE.SphereGeometry(0.11, 20, 20)
      const n = 10
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2
        const elev = Math.sin(i * 2.1) * 0.35
        const r = 1.65
        const mesh = new THREE.Mesh(anchorGeo, i % 2 === 0 ? matHue : matInk)
        mesh.position.set(Math.cos(t) * r, elev, Math.sin(t) * r)
        g.add(mesh)
      }

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.72, 0.012, 8, 80),
        new THREE.MeshStandardMaterial({
          color: accent,
          metalness: 0.9,
          roughness: 0.25,
          transparent: true,
          opacity: 0.65,
        }),
      )
      ring.rotation.x = Math.PI / 2.35
      g.add(ring)
      break
    }

    case 1: {
      /** Internet Body — jittered lattice + crawling nodes (topology, not strands). */
      const cell = 0.52
      const grid = new THREE.BoxGeometry(cell * 0.18, cell * 0.18, cell * 0.18)
      const jitter = cell * 0.22

      let i = 0
      const max = 56
      const dummy = new THREE.Object3D()
      const instCells = new THREE.InstancedMesh(grid, matInk, max)
      const lattice = new THREE.Group()

      for (let gx = -2; gx <= 2 && i < max; gx++) {
        for (let gy = -2; gy <= 2 && i < max; gy++) {
          for (let gz = -2; gz <= 2 && i < max; gz++) {
            if ((gx + gy + gz) % 2 !== 0 && Math.abs(gz) === 2)
              continue
            dummy.position.set(
              gx * cell + (Math.random() - 0.5) * jitter,
              gy * cell + (Math.random() - 0.5) * jitter,
              gz * cell + (Math.random() - 0.5) * jitter,
            )
            const s = 0.72 + Math.random() * 0.48
            dummy.rotation.set(0, gy * 0.18, gx * -0.12)
            dummy.scale.setScalar(s)
            dummy.updateMatrix()
            instCells.setMatrixAt(i, dummy.matrix)

            if ((gx ^ gy ^ gz ^ 888) % 5 === 0) {
              const pulse = new THREE.Mesh(
                new THREE.BoxGeometry(cell * 0.2, cell * 0.2, cell * 0.2),
                matAccent,
              )
              pulse.position.copy(dummy.position)
              pulse.rotation.copy(dummy.rotation)
              pulse.scale.setScalar(s)
              lattice.add(pulse)
            }
            i++
          }
        }
      }
      instCells.count = i
      instCells.instanceMatrix.needsUpdate = true

      lattice.add(instCells)
      lattice.rotation.x = -0.38
      g.add(lattice)

      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.92, 1), matWire)
      g.add(shell)

      break
    }

    case 2: {
      /** Treasury — layered rings / coin stack. */
      const layers = 7
      for (let li = 0; li < layers; li++) {
        const u = li / (layers - 1)
        const major = 0.95 - u * 0.42
        const tube = 0.04 + u * 0.026
        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(major, tube, 14, 64),
          li % 2 === 0
            ? new THREE.MeshStandardMaterial({ color: accent, metalness: 0.75, roughness: 0.28 })
            : new THREE.MeshStandardMaterial({ color: ink, metalness: 0.7, roughness: 0.32 }),
        )
        ringMesh.rotation.x = Math.PI / 2
        ringMesh.position.y = (li - (layers - 1) / 2) * 0.34
        g.add(ringMesh)
      }

      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 2.05, 10),
        new THREE.MeshStandardMaterial({ color: hue, metalness: 0.4, roughness: 0.4 }),
      )
      core.rotation.z = Math.PI / 22
      g.add(core)

      break
    }

    case 3: {
      /** Memory Core — fractured crystal scaffold. */
      const proto = new THREE.OctahedronGeometry(0.32, 0)
      const count = 90
      const inst = new THREE.InstancedMesh(proto, matHue, count)
      const dummy = new THREE.Object3D()

      let placed = 0
      while (placed < count) {
        const x = (Math.random() - 0.5) * 2.4
        const y = (Math.random() - 0.5) * 2.9
        const z = (Math.random() - 0.5) * 2.4
        if (Math.hypot(x, y * 0.65, z) > 1.25)
          continue
        dummy.position.set(x, y, z)
        dummy.rotation.set(Math.random() * 6.2, Math.random() * 6.2, Math.random() * 6.2)
        const sc = 0.35 + Math.random() * 0.95
        dummy.scale.setScalar(sc)
        dummy.updateMatrix()
        inst.setMatrixAt(placed, dummy.matrix)
        placed++
      }
      inst.count = placed
      inst.instanceMatrix.needsUpdate = true

      const cage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.25, 0),
        new THREE.MeshStandardMaterial({
          color: hue,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
          metalness: 0.15,
          roughness: 0.9,
        }),
      )
      g.add(cage)
      g.add(inst)
      break
    }

    default: {
      /** Reproductive Layer — branching fork topology (explicit Y splits, no double helix). */
      const bark = new THREE.MeshStandardMaterial({
        color: accent.clone().multiplyScalar(1.08),
        metalness: 0.35,
        roughness: 0.42,
      })
      const joint = new THREE.MeshStandardMaterial({
        color: hue,
        metalness: 0.25,
        roughness: 0.48,
      })

      const jointGeo = new THREE.SphereGeometry(0.095, 12, 12)

      function bifurcationAxis(direction: THREE.Vector3, seed: number) {
        const jitter = new THREE.Vector3(Math.sin(seed * 1.7), 1.03, Math.cos(seed * 2.1))
        let ax = jitter.cross(direction)
        if (ax.lengthSq() < 1e-6)
          ax = new THREE.Vector3(1, 0.2, 0).cross(direction)
        ax.normalize()
        return ax
      }

      let segmentCount = 0
      const maxSegments = 72

      function limb(
        from: THREE.Vector3,
        dir: THREE.Vector3,
        depth: number,
        thick: number,
        seed: number,
      ) {
        if (depth <= 0 || segmentCount >= maxSegments)
          return

        segmentCount++
        const d = dir.clone().normalize()
        const len = 0.42 + depth * 0.08
        const to = from.clone().addScaledVector(d, len)

        const geo = new THREE.CylinderGeometry(thick * 0.82, thick, len, 8)
        const cyl = new THREE.Mesh(geo, bark)
        const mid = from.clone().add(to).multiplyScalar(0.5)
        cyl.position.copy(mid)
        cyl.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          to.clone().sub(from).normalize(),
        )
        g.add(cyl)

        const jmesh = new THREE.Mesh(jointGeo, joint)
        jmesh.position.copy(to)
        g.add(jmesh)

        const ax = bifurcationAxis(d, seed)
        const spread = 0.62 + depth * 0.04
        limb(to, d.clone().applyAxisAngle(ax, spread), depth - 1, thick * 0.78, seed + 17)
        limb(to, d.clone().applyAxisAngle(ax, -spread), depth - 1, thick * 0.78, seed + 29)
      }

      const rootSphere = new THREE.Mesh(jointGeo, joint)
      rootSphere.scale.setScalar(1.05)
      g.add(rootSphere)
      limb(new THREE.Vector3(0, -1.05, 0), new THREE.Vector3(0.15, 1, 0.08).normalize(), 6, 0.11, 1)

      /** Ground shadow plane hint */
      const disc = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1.62, 40),
        new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
        }),
      )
      disc.rotation.x = -Math.PI / 2
      disc.position.y = -2.05
      g.add(disc)
      break
    }
  }

  return g
}

onMounted(() => {
  const mount = mountRef.value
  if (!mount)
    return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  const zDist = props.organIndex === 2 ? 6.9 : props.organIndex === 4 ? 7.35 : 6.4
  camera.position.set(0, 0, zDist)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  mount.appendChild(renderer.domElement)

  const key = new THREE.DirectionalLight(0xfff4e0, 1.4)
  key.position.set(3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xb5b0a3, 0.52)
  fill.position.set(-4, -1, 4)
  scene.add(fill)
  const rim = new THREE.PointLight(0xff5b1f, 1.2, 14)
  rim.position.set(-2.5, 1.8, -2.8)
  scene.add(rim)
  scene.add(new THREE.AmbientLight(0xf3eee2, 0.32))

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    if (w === 0 || h === 0)
      return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  const idx = Math.min(4, Math.max(0, Math.floor(props.organIndex)))
  const group = buildScene(idx, props.accent, props.hue)
  scene.add(group)

  let mx = 0
  let my = 0
  let tx = 0
  let ty = 0
  const onMove = (e: MouseEvent) => {
    const r = mount.getBoundingClientRect()
    mx = (e.clientX - r.left) / r.width - 0.5
    my = (e.clientY - r.top) / r.height - 0.5
  }
  window.addEventListener('mousemove', onMove)

  const t0 = performance.now()
  const pitchBase = [-0.12, -0.2, -0.05, -0.16, -0.18][idx] ?? 0
  const yawSpeed = [0.32, 0.22, 0.41, 0.25, 0.2][idx] ?? 0.28

  const tick = (now: number) => {
    const t = (now - t0) / 1000
    tx += (mx - tx) * 0.06
    ty += (my - ty) * 0.06
    group.rotation.y = t * yawSpeed + tx * 0.75
    group.rotation.x = pitchBase + ty * 0.38 + Math.sin(t * 0.5) * 0.035
    group.position.y = Math.sin(t * 0.7 + idx * 0.65) * 0.065
    renderer.render(scene, camera)
  }
  const stopLoop = useRenderLoop(mount, tick)

  onUnmounted(() => {
    stopLoop()
    ro.disconnect()
    window.removeEventListener('mousemove', onMove)
    disposeObject3D(group)
    renderer.dispose()
    if (mount.contains(renderer.domElement))
      mount.removeChild(renderer.domElement)
  })
})
</script>

<template>
  <div ref="mount" class="w-full h-full" />
</template>
