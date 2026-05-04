/* global React, THREE */
const { useEffect, useRef } = React;

// ============================================================
// 3D DNA HELIX + MOLECULES — biological structures in WebGL
// ============================================================

// Shared lighting setup
function setupScene(mount) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  // Lighting — warm key, cool fill, ember rim
  const key = new THREE.DirectionalLight(0xfff4e0, 1.4);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xb5b0a3, 0.5);
  fill.position.set(-4, -2, 3);
  scene.add(fill);

  const rim = new THREE.PointLight(0xff5b1f, 1.6, 12);
  rim.position.set(-2, 2, -3);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xf3eee2, 0.35));

  const resize = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  return { scene, camera, renderer, ro };
}

// Materials
function makeAtomMat(color, metalness = 0.2, roughness = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    envMapIntensity: 0.8,
  });
}
function makeBondMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.6,
    roughness: 0.45,
  });
}

// ============================================================
// DNA Helix — two intertwined strands of atoms with rungs
// ============================================================
function DNAHelix({ height = 600, color = '#ff5b1f', density = 28, twist = 1, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount || !window.THREE) return;
    const { scene, camera, renderer, ro } = setupScene(mount);

    const group = new THREE.Group();
    scene.add(group);

    const turns = 2.6;
    const radius = 0.9;
    const totalHeight = 6;

    const colorA = new THREE.Color(color);
    const colorB = new THREE.Color('#0a0a0a');
    const matA = makeAtomMat(colorA, 0.1, 0.3);
    const matB = makeAtomMat(colorB, 0.6, 0.4);
    const matBond = makeBondMat();
    const rungMat = makeAtomMat(new THREE.Color('#c93f0a'), 0.2, 0.5);

    const atomGeo = new THREE.SphereGeometry(0.13, 32, 32);
    const smallGeo = new THREE.SphereGeometry(0.07, 24, 24);

    const strandA = [], strandB = [];

    for (let i = 0; i < density; i++) {
      const t = i / (density - 1);
      const angle = t * Math.PI * 2 * turns * twist;
      const y = (t - 0.5) * totalHeight;

      // Strand A
      const a = new THREE.Mesh(atomGeo, matA);
      a.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      group.add(a);
      strandA.push(a.position.clone());

      // Strand B (180° offset)
      const b = new THREE.Mesh(atomGeo, matB);
      b.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      group.add(b);
      strandB.push(b.position.clone());

      // Rung between every other pair
      if (i % 2 === 0) {
        const dir = new THREE.Vector3().subVectors(b.position, a.position);
        const len = dir.length();
        const bondGeo = new THREE.CylinderGeometry(0.025, 0.025, len, 8);
        const bond = new THREE.Mesh(bondGeo, matBond);
        bond.position.copy(a.position).lerp(b.position, 0.5);
        bond.lookAt(b.position);
        bond.rotateX(Math.PI / 2);
        group.add(bond);

        // Rung accent
        const rung = new THREE.Mesh(smallGeo, rungMat);
        rung.position.copy(a.position).lerp(b.position, 0.5);
        group.add(rung);
      }
    }

    // Backbone tubes
    const curveA = new THREE.CatmullRomCurve3(strandA);
    const curveB = new THREE.CatmullRomCurve3(strandB);
    const tubeGeoA = new THREE.TubeGeometry(curveA, 200, 0.035, 8, false);
    const tubeGeoB = new THREE.TubeGeometry(curveB, 200, 0.035, 8, false);
    const tubeMatA = makeAtomMat(colorA.clone().multiplyScalar(0.7), 0.2, 0.4);
    const tubeMatB = makeAtomMat(colorB, 0.4, 0.5);
    group.add(new THREE.Mesh(tubeGeoA, tubeMatA));
    group.add(new THREE.Mesh(tubeGeoB, tubeMatB));

    // Pointer parallax
    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5);
      my = ((e.clientY - r.top) / r.height - 0.5);
    };
    window.addEventListener('mousemove', onMove);

    let raf, t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;
      group.rotation.y = t * 0.25 + tx * 0.8;
      group.rotation.x = ty * 0.4 + Math.sin(t * 0.4) * 0.05;
      group.position.y = Math.sin(t * 0.5) * 0.08;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick(t0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      atomGeo.dispose();
      smallGeo.dispose();
      tubeGeoA.dispose();
      tubeGeoB.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [color, density, twist]);

  return <div ref={ref} style={{ width: '100%', height, ...style }} />;
}

// ============================================================
// Molecule — a small cluster of atoms with bonds, ball-and-stick
// ============================================================
function Molecule({ height = 400, kind = 'cluster', color = '#ff5b1f', spin = 0.3, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount || !window.THREE) return;
    const { scene, camera, renderer, ro } = setupScene(mount);

    const group = new THREE.Group();
    scene.add(group);

    const matCenter = makeAtomMat(new THREE.Color(color), 0.15, 0.3);
    const matOuter = makeAtomMat(new THREE.Color('#0a0a0a'), 0.5, 0.4);
    const matAccent = makeAtomMat(new THREE.Color('#f3eee2'), 0.3, 0.5);
    const matBond = makeBondMat();

    // Generate atom positions based on kind
    let atoms = [];
    if (kind === 'tetrahedral') {
      // Methane-like
      atoms = [
        { p: [0, 0, 0], r: 0.32, mat: matCenter },
        { p: [0.9, 0.9, 0.9], r: 0.18, mat: matOuter },
        { p: [-0.9, -0.9, 0.9], r: 0.18, mat: matOuter },
        { p: [-0.9, 0.9, -0.9], r: 0.18, mat: matOuter },
        { p: [0.9, -0.9, -0.9], r: 0.18, mat: matOuter },
      ];
    } else if (kind === 'benzene') {
      // Hexagonal ring
      const r = 1.0;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        atoms.push({ p: [Math.cos(a) * r, 0, Math.sin(a) * r], r: 0.22, mat: i % 2 === 0 ? matCenter : matOuter });
      }
      // H atoms outside
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        atoms.push({ p: [Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7], r: 0.13, mat: matAccent });
      }
    } else if (kind === 'chain') {
      // Linear chain with branches
      const n = 7;
      for (let i = 0; i < n; i++) {
        const x = (i - n/2) * 0.55;
        const y = Math.sin(i * 0.7) * 0.3;
        atoms.push({ p: [x, y, 0], r: 0.2, mat: i % 2 === 0 ? matCenter : matOuter });
        if (i % 2 === 1) {
          atoms.push({ p: [x, y + 0.7, 0.3], r: 0.13, mat: matAccent });
        }
      }
    } else {
      // generic cluster — central atom with random satellites
      atoms.push({ p: [0, 0, 0], r: 0.34, mat: matCenter });
      const seedNum = Math.floor(spin * 100);
      const rnd = (n) => {
        const x = Math.sin(n + seedNum) * 10000;
        return x - Math.floor(x);
      };
      for (let i = 0; i < 8; i++) {
        const phi = Math.acos(2 * rnd(i * 3.1) - 1);
        const theta = rnd(i * 5.7) * Math.PI * 2;
        const r = 1.1 + rnd(i * 7.3) * 0.4;
        atoms.push({
          p: [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)],
          r: 0.12 + rnd(i * 9.1) * 0.08,
          mat: i % 3 === 0 ? matAccent : matOuter,
        });
      }
    }

    // Add atom meshes
    const atomMeshes = atoms.map((a) => {
      const geo = new THREE.SphereGeometry(a.r, 32, 32);
      const m = new THREE.Mesh(geo, a.mat);
      m.position.set(...a.p);
      group.add(m);
      return { mesh: m, geo, pos: new THREE.Vector3(...a.p), r: a.r };
    });

    // Auto-bond: connect atoms within distance threshold to nearest neighbors
    const bondGeos = [];
    if (kind === 'benzene') {
      // Ring bonds
      for (let i = 0; i < 6; i++) {
        const a = atomMeshes[i].pos, b = atomMeshes[(i + 1) % 6].pos;
        const len = a.distanceTo(b);
        const g = new THREE.CylinderGeometry(0.035, 0.035, len, 10);
        const m = new THREE.Mesh(g, matBond);
        m.position.copy(a).lerp(b, 0.5);
        m.lookAt(b); m.rotateX(Math.PI / 2);
        group.add(m); bondGeos.push(g);
      }
      // Ring → H bonds
      for (let i = 0; i < 6; i++) {
        const a = atomMeshes[i].pos, b = atomMeshes[i + 6].pos;
        const len = a.distanceTo(b);
        const g = new THREE.CylinderGeometry(0.025, 0.025, len, 8);
        const m = new THREE.Mesh(g, matBond);
        m.position.copy(a).lerp(b, 0.5);
        m.lookAt(b); m.rotateX(Math.PI / 2);
        group.add(m); bondGeos.push(g);
      }
    } else if (kind === 'tetrahedral') {
      const center = atomMeshes[0].pos;
      for (let i = 1; i < atomMeshes.length; i++) {
        const a = center, b = atomMeshes[i].pos;
        const len = a.distanceTo(b);
        const g = new THREE.CylinderGeometry(0.04, 0.04, len, 10);
        const m = new THREE.Mesh(g, matBond);
        m.position.copy(a).lerp(b, 0.5);
        m.lookAt(b); m.rotateX(Math.PI / 2);
        group.add(m); bondGeos.push(g);
      }
    } else {
      // Greedy nearest-neighbor bonds
      for (let i = 0; i < atomMeshes.length; i++) {
        for (let j = i + 1; j < atomMeshes.length; j++) {
          const d = atomMeshes[i].pos.distanceTo(atomMeshes[j].pos);
          if (d < 1.4 && d > 0.05) {
            const a = atomMeshes[i].pos, b = atomMeshes[j].pos;
            const g = new THREE.CylinderGeometry(0.03, 0.03, d, 8);
            const m = new THREE.Mesh(g, matBond);
            m.position.copy(a).lerp(b, 0.5);
            m.lookAt(b); m.rotateX(Math.PI / 2);
            group.add(m); bondGeos.push(g);
          }
        }
      }
    }

    // Pointer parallax
    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5);
      my = ((e.clientY - r.top) / r.height - 0.5);
    };
    window.addEventListener('mousemove', onMove);

    let raf, t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      group.rotation.y = t * spin + tx * 1.2;
      group.rotation.x = Math.sin(t * 0.4) * 0.15 + ty * 0.6;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick(t0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      atomMeshes.forEach((a) => a.geo.dispose());
      bondGeos.forEach((g) => g.dispose());
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [kind, color, spin]);

  return <div ref={ref} style={{ width: '100%', height, ...style }} />;
}

// ============================================================
// MoleculeCloud — many tiny molecules drifting in space
// ============================================================
function MoleculeCloud({ height = 600, count = 14, color = '#ff5b1f', style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount || !window.THREE) return;
    const { scene, camera, renderer, ro } = setupScene(mount);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    scene.add(group);

    const matCenter = makeAtomMat(new THREE.Color(color), 0.1, 0.3);
    const matOuter = makeAtomMat(new THREE.Color('#0a0a0a'), 0.5, 0.4);
    const matAccent = makeAtomMat(new THREE.Color('#f3eee2'), 0.3, 0.5);
    const matBond = makeBondMat();

    const atomGeoBig = new THREE.SphereGeometry(1, 24, 24);
    const atomGeoSmall = new THREE.SphereGeometry(1, 16, 16);

    const molecules = [];

    for (let i = 0; i < count; i++) {
      const m = new THREE.Group();
      const cx = (Math.random() - 0.5) * 9;
      const cy = (Math.random() - 0.5) * 6;
      const cz = (Math.random() - 0.5) * 4 - 1;
      m.position.set(cx, cy, cz);

      const scale = 0.25 + Math.random() * 0.5;
      const atomCount = 3 + Math.floor(Math.random() * 4);
      const positions = [new THREE.Vector3(0, 0, 0)];

      // Center atom
      const ca = new THREE.Mesh(atomGeoBig, matCenter);
      ca.scale.setScalar(0.35 * scale);
      m.add(ca);

      // Satellite atoms
      for (let j = 1; j < atomCount; j++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = 0.9;
        const p = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        );
        positions.push(p);
        const mat = j % 2 === 0 ? matAccent : matOuter;
        const sphere = new THREE.Mesh(atomGeoSmall, mat);
        sphere.position.copy(p);
        sphere.scale.setScalar(0.2 * scale);
        m.add(sphere);

        // Bond center → satellite
        const len = p.length();
        const bg = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, len, 8);
        const bond = new THREE.Mesh(bg, matBond);
        bond.position.copy(p).multiplyScalar(0.5);
        bond.lookAt(p);
        bond.rotateX(Math.PI / 2);
        m.add(bond);
      }

      m.scale.setScalar(scale);
      group.add(m);
      molecules.push({
        mesh: m,
        rx: (Math.random() - 0.5) * 0.4,
        ry: (Math.random() - 0.5) * 0.5,
        rz: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        baseY: cy,
      });
    }

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5);
      my = ((e.clientY - r.top) / r.height - 0.5);
    };
    window.addEventListener('mousemove', onMove);

    let raf, t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      molecules.forEach((mol) => {
        mol.mesh.rotation.x = t * mol.rx;
        mol.mesh.rotation.y = t * mol.ry;
        mol.mesh.rotation.z = t * mol.rz;
        mol.mesh.position.y = mol.baseY + Math.sin(t * mol.speed + mol.phase) * 0.2;
      });
      group.rotation.y = tx * 0.4;
      group.rotation.x = ty * 0.25;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick(t0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      atomGeoBig.dispose();
      atomGeoSmall.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [count, color]);

  return <div ref={ref} style={{ width: '100%', height, ...style }} />;
}

window.DNAHelix = DNAHelix;
window.Molecule = Molecule;
window.MoleculeCloud = MoleculeCloud;
// Keep Organism3D alias pointing to MoleculeCloud for backwards-compat (in case any section still references it)
window.Organism3D = MoleculeCloud;
