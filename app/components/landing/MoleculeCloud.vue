<script setup lang="ts">
import * as THREE from 'three'

interface Props {
  count?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  count: 14,
  color: '#ff5b1f',
})

const mountRef = useTemplateRef<HTMLDivElement>('mount')

onMounted(() => {
  const mount = mountRef.value
  if (!mount) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 8)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  mount.appendChild(renderer.domElement)

  const key = new THREE.DirectionalLight(0xfff4e0, 1.4)
  key.position.set(3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xb5b0a3, 0.5)
  fill.position.set(-4, -2, 3)
  scene.add(fill)
  const rim = new THREE.PointLight(0xff5b1f, 1.6, 12)
  rim.position.set(-2, 2, -3)
  scene.add(rim)
  scene.add(new THREE.AmbientLight(0xf3eee2, 0.35))

  const resize = () => {
    const w = mount.clientWidth, h = mount.clientHeight
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  const group = new THREE.Group()
  scene.add(group)

  const { count, color } = props
  const matCenter = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: 0.1, roughness: 0.3 })
  const matOuter = new THREE.MeshStandardMaterial({ color: new THREE.Color('#0a0a0a'), metalness: 0.5, roughness: 0.4 })
  const matAccent = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f3eee2'), metalness: 0.3, roughness: 0.5 })
  const matBond = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.45 })

  const atomGeoBig = new THREE.SphereGeometry(1, 24, 24)
  const atomGeoSmall = new THREE.SphereGeometry(1, 16, 16)

  interface MolData {
    mesh: THREE.Group
    rx: number
    ry: number
    rz: number
    phase: number
    speed: number
    baseY: number
  }
  const molecules: MolData[] = []

  for (let i = 0; i < count; i++) {
    const m = new THREE.Group()
    const cx = (Math.random() - 0.5) * 9
    const cy = (Math.random() - 0.5) * 6
    const cz = (Math.random() - 0.5) * 4 - 1
    m.position.set(cx, cy, cz)

    const scale = 0.25 + Math.random() * 0.5
    const atomCount = 3 + Math.floor(Math.random() * 4)
    const positions: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]

    const ca = new THREE.Mesh(atomGeoBig, matCenter)
    ca.scale.setScalar(0.35 * scale)
    m.add(ca)

    for (let j = 1; j < atomCount; j++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = 0.9
      const p = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      )
      positions.push(p)
      const mat = j % 2 === 0 ? matAccent : matOuter
      const sphere = new THREE.Mesh(atomGeoSmall, mat)
      sphere.position.copy(p)
      sphere.scale.setScalar(0.2 * scale)
      m.add(sphere)

      const len = p.length()
      const bg = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, len, 8)
      const bond = new THREE.Mesh(bg, matBond)
      bond.position.copy(p).multiplyScalar(0.5)
      bond.lookAt(p)
      bond.rotateX(Math.PI / 2)
      m.add(bond)
    }

    m.scale.setScalar(scale)
    group.add(m)
    molecules.push({ mesh: m, rx: (Math.random() - 0.5) * 0.4, ry: (Math.random() - 0.5) * 0.5, rz: (Math.random() - 0.5) * 0.3, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5, baseY: cy })
  }

  let mx = 0, my = 0, tx = 0, ty = 0
  const onMove = (e: MouseEvent) => {
    const r = mount.getBoundingClientRect()
    mx = (e.clientX - r.left) / r.width - 0.5
    my = (e.clientY - r.top) / r.height - 0.5
  }
  window.addEventListener('mousemove', onMove)

  const t0 = performance.now()
  const tick = (now: number) => {
    const t = (now - t0) / 1000
    tx += (mx - tx) * 0.04
    ty += (my - ty) * 0.04
    molecules.forEach((mol) => {
      mol.mesh.rotation.x = t * mol.rx
      mol.mesh.rotation.y = t * mol.ry
      mol.mesh.rotation.z = t * mol.rz
      mol.mesh.position.y = mol.baseY + Math.sin(t * mol.speed + mol.phase) * 0.2
    })
    group.rotation.y = tx * 0.4
    group.rotation.x = ty * 0.25
    renderer.render(scene, camera)
  }
  const stopLoop = useRenderLoop(mount, tick)

  onUnmounted(() => {
    stopLoop()
    ro.disconnect()
    window.removeEventListener('mousemove', onMove)
    renderer.dispose()
    if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
  })
})
</script>

<template>
  <div ref="mount" class="w-full h-full" />
</template>
