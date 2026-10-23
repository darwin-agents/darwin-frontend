<script setup lang="ts">
import * as THREE from 'three'

interface Props {
  color?: string
  density?: number
  twist?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: '#ff5b1f',
  density: 28,
  twist: 1,
})

const mountRef = useTemplateRef<HTMLDivElement>('mount')

onMounted(() => {
  const mount = mountRef.value
  if (!mount) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 6)

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

  const turns = 2.6
  const radius = 0.9
  const totalHeight = 6
  const { density, twist, color } = props

  const colorA = new THREE.Color(color)
  const colorB = new THREE.Color('#0a0a0a')
  const matA = new THREE.MeshStandardMaterial({ color: colorA, metalness: 0.1, roughness: 0.3 })
  const matB = new THREE.MeshStandardMaterial({ color: colorB, metalness: 0.6, roughness: 0.4 })
  const matBond = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.45 })
  const rungMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#c93f0a'), metalness: 0.2, roughness: 0.5 })

  const atomGeo = new THREE.SphereGeometry(0.13, 32, 32)
  const smallGeo = new THREE.SphereGeometry(0.07, 24, 24)
  const strandA: THREE.Vector3[] = []
  const strandB: THREE.Vector3[] = []

  for (let i = 0; i < density; i++) {
    const t = i / (density - 1)
    const angle = t * Math.PI * 2 * turns * twist
    const y = (t - 0.5) * totalHeight

    const a = new THREE.Mesh(atomGeo, matA)
    a.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    group.add(a)
    strandA.push(a.position.clone())

    const b = new THREE.Mesh(atomGeo, matB)
    b.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)
    group.add(b)
    strandB.push(b.position.clone())

    if (i % 2 === 0) {
      const dir = new THREE.Vector3().subVectors(b.position, a.position)
      const len = dir.length()
      const bondGeo = new THREE.CylinderGeometry(0.025, 0.025, len, 8)
      const bond = new THREE.Mesh(bondGeo, matBond)
      bond.position.copy(a.position).lerp(b.position, 0.5)
      bond.lookAt(b.position)
      bond.rotateX(Math.PI / 2)
      group.add(bond)
      const rung = new THREE.Mesh(smallGeo, rungMat)
      rung.position.copy(a.position).lerp(b.position, 0.5)
      group.add(rung)
    }
  }

  const curveA = new THREE.CatmullRomCurve3(strandA)
  const curveB = new THREE.CatmullRomCurve3(strandB)
  const tubeGeoA = new THREE.TubeGeometry(curveA, 200, 0.035, 8, false)
  const tubeGeoB = new THREE.TubeGeometry(curveB, 200, 0.035, 8, false)
  group.add(new THREE.Mesh(tubeGeoA, new THREE.MeshStandardMaterial({ color: colorA.clone().multiplyScalar(0.7), metalness: 0.2, roughness: 0.4 })))
  group.add(new THREE.Mesh(tubeGeoB, new THREE.MeshStandardMaterial({ color: colorB, metalness: 0.4, roughness: 0.5 })))

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
    tx += (mx - tx) * 0.06
    ty += (my - ty) * 0.06
    group.rotation.y = t * 0.25 + tx * 0.8
    group.rotation.x = ty * 0.4 + Math.sin(t * 0.4) * 0.05
    group.position.y = Math.sin(t * 0.5) * 0.08
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
